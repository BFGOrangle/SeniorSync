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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;

@Service
@RequiredArgsConstructor
@Slf4j
public class AISpamFilterService implements IAISpamFilterService {

    private final SeniorRequestRepository seniorRequestRepository;
    private final SpamDetectionResultRepository spamDetectionResultRepository;

    @Qualifier("claude")
    private final LLMClient llmClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Track ongoing processing to prevent duplicate LLM calls
    private final ConcurrentHashMap<Long, CompletableFuture<SpamFilterResultDto>> processingRequests = new ConcurrentHashMap<>();

    @Autowired
    @Qualifier("taskExecutor") // Use Spring's configured async executor
    private Executor asyncExecutor;

    @Override
    @Async
    @Transactional
    public CompletableFuture<SpamFilterResultDto> checkSingleRequestAsync(Long requestId) {
        log.info("Checking request {} for spam asynchronously", requestId);
        return getOrCreateProcessingFuture(requestId);
    }

    @Override
    @Async
    public CompletableFuture<BatchSpamFilterResultDto> checkBatchRequestsAsync(List<Long> requestIds) {
        log.info("Checking {} requests for spam with fan-out", requestIds.size());

        // Fan out - each request gets its own future (reuses existing if already processing)
        List<CompletableFuture<SpamFilterResultDto>> futures = requestIds.stream()
                .map(this::getOrCreateProcessingFuture)
                .toList();

        // Combine all results
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> {
                    List<SpamFilterResultDto> results = futures.stream()
                            .map(future -> {
                                try {
                                    return future.join();
                                } catch (Exception e) {
                                    log.error("Error processing request: {}", e.getMessage());
                                    // Return error result
                                    SpamFilterResultDto errorResult = new SpamFilterResultDto();
                                    errorResult.setIsSpam(false);
                                    errorResult.setDetectionReason("Error: " + e.getMessage());
                                    return errorResult;
                                }
                            })
                            .toList();

                    int spamCount = (int) results.stream()
                            .mapToInt(result -> result.getIsSpam() ? 1 : 0)
                            .sum();

                    BatchSpamFilterResultDto batchResult = new BatchSpamFilterResultDto();
                    batchResult.setResults(results);
                    batchResult.setTotalProcessed(results.size());
                    batchResult.setSpamDetected(spamCount);

                    return batchResult;
                });
    }

    @Override
    public List<SpamFilterResultDto> getSpamDetectionHistory() {
        List<SpamDetectionResult> spamResults = spamDetectionResultRepository.findAllSpamResults();
        return spamResults.stream()
                .map(this::mapToDto)
                .toList();
    }


    private CompletableFuture<SpamFilterResultDto> getOrCreateProcessingFuture(Long requestId) {
        // Check if already processing
        CompletableFuture<SpamFilterResultDto> existingFuture = processingRequests.get(requestId);
        if (existingFuture != null) {
            log.info("Request {} already being processed, reusing future", requestId);
            return existingFuture;
        }

        // Create new processing future
        CompletableFuture<SpamFilterResultDto> newFuture = CompletableFuture
                .supplyAsync(() -> processRequest(requestId), asyncExecutor)
                .whenComplete((result, throwable) -> {
                    // Clean up when done
                    processingRequests.remove(requestId);
                });

        // Try to register atomically
        CompletableFuture<SpamFilterResultDto> registeredFuture = processingRequests.putIfAbsent(requestId, newFuture);

        if (registeredFuture != null) {
            log.info("Another thread registered request {}, using that future", requestId);
            return registeredFuture;
        }

        return newFuture;
    }

    @Transactional
    private SpamFilterResultDto processRequest(Long requestId) {
        Optional<SeniorRequest> requestOpt = seniorRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new IllegalArgumentException("Request not found with ID: " + requestId);
        }
        return performSpamDetection(requestOpt.get());
    }

    private SpamFilterResultDto performSpamDetection(SeniorRequest request) {
        // Check if spam detection already exists for this request
        Optional<SpamDetectionResult> existingResult = spamDetectionResultRepository
                .findByRequestId(request.getId());

        if (existingResult.isPresent()) {
            log.info("Using existing spam detection result for request {}", request.getId());
            return mapToDto(existingResult.get());
        }

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
