package orangle.seniorsync.crm.aifeatures.service;
import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.pipeline.CoreEntityMention;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.*;

@Service
public class SanitiseRequestDetailsService implements ISanitiseRequestDetailsService {

    public enum Mode { TOKEN, DROP }

    public static final class Result {
        public final String sanitizedText;
        public final Map<String, String> placeholderToOriginal;
        public Result(String sanitizedText, Map<String, String> map) {
            this.sanitizedText = sanitizedText;
            this.placeholderToOriginal = map;
        }
    }

    // ======= Config =======
    private static final String SALT = System.getenv().getOrDefault("PII_SALT", "rotate-this");
    private static final String OPEN = "⟪";
    private static final String CLOSE = "⟫";

    // Which NER labels to redact via model
    private static final Set<String> NER_LABELS_TO_DROP = new HashSet<>(
            Arrays.asList("PERSON", "ORGANIZATION", "LOCATION")
            // add fine-grained labels if your model provides them:
            // "CITY", "STATE_OR_PROVINCE", "COUNTRY", "EMAIL", etc.
    );

    // ======= Rule patterns (the tricky ones) =======
    private static final Pattern EMAIL = Pattern.compile(
            "\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[A-Za-z]{2,}\\b"
    );

    private static final Pattern PHONE = Pattern.compile(
            "(?<!\\w)(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(\\d{2,4}\\)|\\d{2,4})[-.\\s]?\\d{3,4}[-.\\s]?\\d{4}(?!\\w)"
    );

    private static final Pattern IPV4 = Pattern.compile(
            "\\b(?:(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\b"
    );

    private static final Pattern CREDIT_CARD = Pattern.compile(
            "(?<!\\d)(?:\\d[ -]?){13,19}(?!\\d)"
    );

    // Singapore NRIC/FIN (we validate with checksum)
    private static final Pattern SG_NRIC_FIN = Pattern.compile(
            "\\b[STFGstfg]\\d{7}[A-Za-z]\\b"
    );

    // Labeled DOB (e.g., "DOB: 1990-01-02" or "date of birth - 02/03/1990")
    private static final Pattern DOB_LABELED = Pattern.compile(
            "(?i)(\\b(?:dob|date\\s*of\\s*birth)\\b\\s*[:\\-]?\\s*)"
                    + "(\\d{4}[\\/\\-]\\d{1,2}[\\/\\-]\\d{1,2}|\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})"
    );

    // Numeric IDs following keywords (account, policy, etc.)
    private static final Pattern KEYWORDED_ID = Pattern.compile(
            "(?i)\\b(account|acct|iban|policy|member|customer|passport|driver(?:\\s*lic(?:ense)?)?)\\b[:#\\s-]*([A-Z0-9-]{5,})"
    );

    // ======= Stanford CoreNLP (singleton) =======
    private static final StanfordCoreNLP PIPELINE = buildPipeline();

    private static StanfordCoreNLP buildPipeline() {
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,ner");
        props.setProperty("ner.applyNumericClassifiers", "true");
        props.setProperty("ssplit.newlineIsSentenceBreak", "two");
        return new StanfordCoreNLP(props);
    }

    // ======= Public API =======
    public String sanitise(String text) {
        if (text == null || text.isEmpty()) return text;

        // 1) Collect spans from NER
        List<Span> spans = new ArrayList<>();
        CoreDocument doc = new CoreDocument(text);
        PIPELINE.annotate(doc);
        for (CoreEntityMention em : doc.entityMentions()) {
            String label = em.entityType();
            if (NER_LABELS_TO_DROP.contains(label)) {
                spans.add(new Span(em.charOffsets().first, em.charOffsets().second, label, em.text()));
            }
        }

        // 2) Collect spans from rules (emails, phones, ip, cards, NRIC, DOB, keyword-IDs)
        addRegexSpans(spans, text, EMAIL, "EMAIL", null);
        addRegexSpans(spans, text, PHONE, "PHONE", null);
        addRegexSpans(spans, text, IPV4, "IPV4", null);

        // Credit cards: only if Luhn-valid
        addRegexSpans(spans, text, CREDIT_CARD, "CREDIT_CARD", s -> luhnValid(s) ? s : null);

        // SG NRIC/FIN: only if checksum-valid
        addRegexSpans(spans, text, SG_NRIC_FIN, "NRIC", s -> isValidNricFin(s) ? s.toUpperCase(Locale.ROOT) : null);

        // Labeled DOB: replace only the date part (group 2)
        Matcher dob = DOB_LABELED.matcher(text);
        while (dob.find()) {
            spans.add(new Span(dob.start(2), dob.end(2), "DOB", dob.group(2)));
        }

        // Keyworded numeric IDs (capture group 2)
        Matcher kid = KEYWORDED_ID.matcher(text);
        while (kid.find()) {
            spans.add(new Span(kid.start(2), kid.end(2), "ID", kid.group(2)));
        }

        // 3) Resolve overlaps (keep longest spans)
        List<Span> resolved = resolveOverlaps(spans);

        // 4) Apply replacements right-to-left (always TOKENIZE)
        String out = text;
        resolved.sort(Comparator.comparingInt(s -> -s.start)); // reverse by start
        for (Span s : resolved) {
            String repl = tokenFor(s.label, s.raw);
            out = out.substring(0, s.start) + repl + out.substring(s.end);
        }

        // 5) Tidy whitespace
        out = out.replaceAll("[ \\t]{2,}", " ").trim();
        return out;
    }


    // ======= Helpers =======
    private static final class Span {
        final int start, end;
        final String label, raw;
        Span(int start, int end, String label, String raw) {
            this.start = start; this.end = end; this.label = label; this.raw = raw;
        }
        int len() { return end - start; }
    }

    private static void addRegexSpans(List<Span> spans, String text, Pattern p, String label,
                                      java.util.function.Function<String,String> validatorOrNormalizer) {
        Matcher m = p.matcher(text);
        while (m.find()) {
            String match = m.group();
            if (validatorOrNormalizer != null) {
                String ok = validatorOrNormalizer.apply(match);
                if (ok == null) continue;
                match = ok;
            }
            spans.add(new Span(m.start(), m.end(), label, match));
        }
    }

    private static List<Span> resolveOverlaps(List<Span> spans) {
        // Sort by start asc, length desc; then greedily keep non-overlapping
        spans.sort((a, b) -> {
            int cmp = Integer.compare(a.start, b.start);
            if (cmp != 0) return cmp;
            return Integer.compare(b.len(), a.len());
        });
        List<Span> out = new ArrayList<>();
        int lastEnd = -1;
        for (Span s : spans) {
            if (s.start >= lastEnd) {
                out.add(s);
                lastEnd = s.end;
            }
        }
        return out;
    }

    private static String tokenFor(String type, String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update((SALT + raw).getBytes(StandardCharsets.UTF_8));
            byte[] d = md.digest();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(8, d.length); i++) sb.append(String.format("%02x", d[i]));
            return OPEN + type + "_" + sb + CLOSE;
        } catch (Exception e) {
            return OPEN + type + CLOSE;
        }
    }

    private static boolean luhnValid(String s) {
        String digits = s.replaceAll("[ -]", "");
        if (digits.length() < 13 || digits.length() > 19 || !digits.chars().allMatch(Character::isDigit))
            return false;
        int sum = 0; boolean alt = false;
        for (int i = digits.length() - 1; i >= 0; i--) {
            int n = digits.charAt(i) - '0';
            if (alt) { n *= 2; if (n > 9) n -= 9; }
            sum += n; alt = !alt;
        }
        return sum % 10 == 0;
    }

    // SG NRIC/FIN checksum
    private static boolean isValidNricFin(String s) {
        String v = s.toUpperCase(Locale.ROOT);
        if (!SG_NRIC_FIN.matcher(v).matches()) return false;
        char prefix = v.charAt(0);
        char suffix = v.charAt(8);
        int[] weights = {2,7,6,5,4,3,2};
        int sum = 0;
        for (int i = 1; i <= 7; i++) sum += (v.charAt(i) - '0') * weights[i - 1];
        if (prefix == 'T' || prefix == 'G') sum += 4;
        String nricMap = "JZIHGFEDCBA";
        String finMap  = "XWUTRQPNMLK";
        int remainder = sum % 11;
        char expected = (prefix == 'S' || prefix == 'T') ? nricMap.charAt(remainder) : finMap.charAt(remainder);
        return suffix == expected;
    }
}
