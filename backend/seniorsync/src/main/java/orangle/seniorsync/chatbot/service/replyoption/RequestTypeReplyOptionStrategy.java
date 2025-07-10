package orangle.seniorsync.chatbot.service.replyoption;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.ReplyOption;
import orangle.seniorsync.crm.requestmanagement.model.RequestType;
import orangle.seniorsync.crm.requestmanagement.repository.RequestTypeRepository;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@Order(1)
public class RequestTypeReplyOptionStrategy implements IReplyOptionStrategy {

    private static final Map<String, Map<String, String>> FALLBACK_TRANSLATIONS = createFallbackTranslations();

    private final RequestTypeRepository requestTypeRepository;

    public RequestTypeReplyOptionStrategy(RequestTypeRepository requestTypeRepository) {
        this.requestTypeRepository = requestTypeRepository;
    }

    @Override
    public boolean isApplicable(String campaignName, String state) {
        return "lodging_request".equals(campaignName) && state.equals("AWAITING_TYPE");
    }

    @Override
    public List<ReplyOption> getReplyOptions(String campaignName, String state, String languageCode) {
        List<RequestType> requestTypes = requestTypeRepository.findAll();
        return requestTypes.stream()
                .map(requestType -> new ReplyOption(
                        getTranslatedName(requestType.getName(), languageCode),
                        requestType.getName(),
                        "TYPE_SUBMITTED")
                )
                .toList();
    }

    private String getTranslatedName(String originalName, String languageCode) {
        // TODO: Replace with database lookup or a better approach (We can KIV this for now)
        Map<String, String> translations = FALLBACK_TRANSLATIONS.get(originalName);
        if (translations != null && translations.containsKey(languageCode)) {
            return translations.get(languageCode);
        }
        log.warn("No translation found for request type '{}' in language '{}', using original name '{}'", originalName, languageCode, originalName);
        return originalName;
    }

    // Temporary workaround to provide translations for request types
    private static Map<String, Map<String, String>> createFallbackTranslations() {
        Map<String, Map<String, String>> res = new HashMap<>();

        Map<String, String> readingAssistance = new HashMap<>();
        readingAssistance.put("en", "Reading Assistance");
        readingAssistance.put("zh-CN", "阅读协助");
        readingAssistance.put("ms", "Bantuan Membaca");
        readingAssistance.put("ta", "வாசிப்பு உதவி");
        res.put("Reading Assistance", readingAssistance);

        Map<String, String> physicalItemMoving = new HashMap<>();
        physicalItemMoving.put("en", "Physical Item Moving");
        physicalItemMoving.put("zh-CN", "物品搬运");
        physicalItemMoving.put("ms", "Pemindahan Barang Fizikal");
        physicalItemMoving.put("ta", "உடல் பொருள் நகர்த்துதல்");
        res.put("Physical Item Moving", physicalItemMoving);

        Map<String, String> transportation = new HashMap<>();
        transportation.put("en", "Transportation");
        transportation.put("zh-CN", "交通运输");
        transportation.put("ms", "Pengangkutan");
        transportation.put("ta", "போக்குவரத்து");
        res.put("Transportation", transportation);

        Map<String, String> medicationReminders = new HashMap<>();
        medicationReminders.put("en", "Medication Reminders");
        medicationReminders.put("zh-CN", "用药提醒");
        medicationReminders.put("ms", "Peringatan Ubat");
        medicationReminders.put("ta", "மருந்து நினைவூட்டல்கள்");
        res.put("Medication Reminders", medicationReminders);

        Map<String, String> groceryShopping = new HashMap<>();
        groceryShopping.put("en", "Grocery Shopping");
        groceryShopping.put("zh-CN", "食品采购");
        groceryShopping.put("ms", "Membeli Barangan Runcit");
        groceryShopping.put("ta", "மளிகை கடை");
        res.put("Grocery Shopping", groceryShopping);

        Map<String, String> mealPreparation = new HashMap<>();
        mealPreparation.put("en", "Meal Preparation");
        mealPreparation.put("zh-CN", "餐食准备");
        mealPreparation.put("ms", "Penyediaan Makanan");
        mealPreparation.put("ta", "உணவு தயாரிப்பு");
        res.put("Meal Preparation", mealPreparation);

        Map<String, String> housekeeping = new HashMap<>();
        housekeeping.put("en", "Housekeeping");
        housekeeping.put("zh-CN", "家务清洁");
        housekeeping.put("ms", "Pengemasan Rumah");
        housekeeping.put("ta", "வீட்டு பராமரிப்பு");
        res.put("Housekeeping", housekeeping);

        Map<String, String> technologySupport = new HashMap<>();
        technologySupport.put("en", "Technology Support");
        technologySupport.put("zh-CN", "技术支持");
        technologySupport.put("ms", "Sokongan Teknologi");
        technologySupport.put("ta", "தொழில்நுட்ப ஆதரவு");
        res.put("Technology Support", technologySupport);

        Map<String, String> socialVisit = new HashMap<>();
        socialVisit.put("en", "Social Visit");
        socialVisit.put("zh-CN", "社交拜访");
        socialVisit.put("ms", "Lawatan Sosial");
        socialVisit.put("ta", "சமூக வருகை");
        res.put("Social Visit", socialVisit);

        Map<String, String> wellnessCheck = new HashMap<>();
        wellnessCheck.put("en", "Wellness Check");
        wellnessCheck.put("zh-CN", "健康检查");
        wellnessCheck.put("ms", "Pemeriksaan Kesihatan");
        wellnessCheck.put("ta", "நல்வாழ்வு சோதனை");
        res.put("Wellness Check", wellnessCheck);

        Map<String, String> outdoorAssistance = new HashMap<>();
        outdoorAssistance.put("en", "Outdoor Assistance");
        outdoorAssistance.put("zh-CN", "户外协助");
        outdoorAssistance.put("ms", "Bantuan Luar Rumah");
        outdoorAssistance.put("ta", "வெளிப்புற உதவி");
        res.put("Outdoor Assistance", outdoorAssistance);

        Map<String, String> administrativeHelp = new HashMap<>();
        administrativeHelp.put("en", "Administrative Help");
        administrativeHelp.put("zh-CN", "行政帮助");
        administrativeHelp.put("ms", "Bantuan Pentadbiran");
        administrativeHelp.put("ta", "நிர்வாக உதவி");
        res.put("Administrative Help", administrativeHelp);

        Map<String, String> personalCare = new HashMap<>();
        personalCare.put("en", "Personal Care");
        personalCare.put("zh-CN", "个人护理");
        personalCare.put("ms", "Penjagaan Peribadi");
        personalCare.put("ta", "தனிப்பட்ட பராமரிப்பு");
        res.put("Personal Care", personalCare);

        Map<String, String> exerciseSupport = new HashMap<>();
        exerciseSupport.put("en", "Exercise Support");
        exerciseSupport.put("zh-CN", "运动支持");
        exerciseSupport.put("ms", "Sokongan Senaman");
        exerciseSupport.put("ta", "உடற்பயிற்சி ஆதரவு");
        res.put("Exercise Support", exerciseSupport);

        Map<String, String> errands = new HashMap<>();
        errands.put("en", "Errands");
        errands.put("zh-CN", "跑腿服务");
        errands.put("ms", "Urusan Kecil");
        errands.put("ta", "சிறு பணிகள்");
        res.put("Errands", errands);

        return res;
    }
}
