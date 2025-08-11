package orangle.seniorsync.crm.aifeatures.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.aifeatures.client.LLMClient;
import orangle.seniorsync.crm.aifeatures.dto.BatchSpamFilterResultDto;
import orangle.seniorsync.crm.aifeatures.dto.SpamFilterResultDto;
import orangle.seniorsync.crm.aifeatures.model.SpamDetectionResult;
import orangle.seniorsync.crm.aifeatures.repository.SpamDetectionResultRepository;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AISpamFilterService implements IAISpamFilterService {

    private final SeniorRequestRepository seniorRequestRepository;
    private final SpamDetectionResultRepository spamDetectionResultRepository;

    @Qualifier("claude")
    private final LLMClient llmClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public SpamFilterResultDto checkSingleRequest(Long requestId) {
        log.info("Checking request {} for spam", requestId);

        Optional<SeniorRequest> requestOpt = seniorRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new IllegalArgumentException("Request not found with ID: " + requestId);
        }

        SeniorRequest request = requestOpt.get();
        return performSpamDetection(request);
    }

    @Override
    @Transactional
    public BatchSpamFilterResultDto checkBatchRequests(List<Long> requestIds) {
        log.info("Checking {} requests for spam", requestIds.size());

        List<SeniorRequest> requests = seniorRequestRepository.findAllById(requestIds);
        List<SpamFilterResultDto> results = new ArrayList<>();
        int spamCount = 0;

        for (SeniorRequest request : requests) {
            try {
                SpamFilterResultDto result = performSpamDetection(request);
                results.add(result);
                if (result.getIsSpam()) {
                    spamCount++;
                }
            } catch (Exception e) {
                log.error("Error checking request {} for spam: {}", request.getId(), e.getMessage());
                // Create error result
                SpamFilterResultDto errorResult = new SpamFilterResultDto();
                errorResult.setRequestId(request.getId());
                errorResult.setIsSpam(false);
                errorResult.setDetectionReason("Error during detection: " + e.getMessage());
                results.add(errorResult);
            }
        }

        BatchSpamFilterResultDto batchResult = new BatchSpamFilterResultDto();
        batchResult.setResults(results);
        batchResult.setTotalProcessed(results.size());
        batchResult.setSpamDetected(spamCount);

        return batchResult;
    }

    @Override
    public List<SpamFilterResultDto> getSpamDetectionHistory() {
        List<SpamDetectionResult> spamResults = spamDetectionResultRepository.findAllSpamResults();
        return spamResults.stream()
                .map(this::mapToDto)
                .toList();
    }

    private SpamFilterResultDto performSpamDetection(SeniorRequest request) {
        String prompt = buildSpamDetectionPrompt(request);
        String llmResponse = llmClient.callLLM(prompt);

        if (llmResponse == null || llmResponse.trim().isEmpty()) {
            throw new RuntimeException("LLM returned empty response");
        }

        return parseSpamDetectionResponse(request.getId(), llmResponse);
    }

    private String buildSpamDetectionPrompt(SeniorRequest request) {
        return String.format("""
            You are a spam detection system for senior care requests. Analyze the following request and determine if it's spam.
            
            Title: %s
            Description: %s
            Priority: %d
            
            Please respond with a JSON object in the following format:
            {
                "is_spam": true/false,
                "confidence": 0.95,
                "reason": "Brief explanation of why this is/isn't spam"
            }
            
            Consider the following as potential spam indicators:
            - Irrelevant content not related to senior care
            - Promotional or commercial content
            - Repeated identical requests
            - Suspicious patterns or unusual language
            - Requests that seem automated or bot-generated
            
            Respond only with the JSON object, no additional text.
            """,
            request.getTitle(),
            request.getDescription(),
            request.getPriority());
    }

    private SpamFilterResultDto parseSpamDetectionResponse(Long requestId, String llmResponse) {
        try {
            JsonNode responseJson = objectMapper.readTree(llmResponse);

            boolean isSpam = responseJson.path("is_spam").asBoolean();
            double confidence = responseJson.path("confidence").asDouble();
            String reason = responseJson.path("reason").asText();

            // Save to database
            SpamDetectionResult entity = new SpamDetectionResult();
            entity.setRequestId(requestId);
            entity.setIsSpam(isSpam);
            entity.setConfidenceScore(BigDecimal.valueOf(confidence));
            entity.setDetectionReason(reason);

            SpamDetectionResult saved = spamDetectionResultRepository.save(entity);

            return mapToDto(saved);

        } catch (Exception e) {
            log.error("Error parsing LLM response: {}", e.getMessage());
            log.debug("LLM Response was: {}", llmResponse);

            // Create fallback result
            SpamDetectionResult fallback = new SpamDetectionResult();
            fallback.setRequestId(requestId);
            fallback.setIsSpam(false);
            fallback.setDetectionReason("Failed to parse LLM response: " + e.getMessage());

            SpamDetectionResult saved = spamDetectionResultRepository.save(fallback);
            return mapToDto(saved);
        }
    }

    private SpamFilterResultDto mapToDto(SpamDetectionResult entity) {
        SpamFilterResultDto dto = new SpamFilterResultDto();
        dto.setRequestId(entity.getRequestId());
        dto.setIsSpam(entity.getIsSpam());
        dto.setConfidenceScore(entity.getConfidenceScore());
        dto.setDetectionReason(entity.getDetectionReason());
        dto.setDetectedAt(entity.getDetectedAt());
        return dto;
    }
}
