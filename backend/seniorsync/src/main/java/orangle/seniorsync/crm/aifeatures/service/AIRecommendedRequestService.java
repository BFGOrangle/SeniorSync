package orangle.seniorsync.crm.aifeatures.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.aifeatures.client.LLMClient;
import orangle.seniorsync.crm.aifeatures.dto.*;
import orangle.seniorsync.crm.aifeatures.mapper.AIRecommendationMapper;
import orangle.seniorsync.crm.aifeatures.model.AIRecommendation;
import orangle.seniorsync.crm.aifeatures.repository.AIRecommendationRepository;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AIRecommendedRequestService implements IAIRecommendedRequestService {

    private final AIRecommendationRepository aiRecommendationRepository;
    private final SeniorRequestRepository seniorRequestRepository;
    private final AIRecommendationMapper mapper;
    private final LLMClient llmClient;
    private final Executor asyncExecutor;

    // Track ongoing processing to prevent duplicate LLM calls (same pattern as spam filter)
    private final ConcurrentHashMap<Long, CompletableFuture<AIRecommendedRequestDto>> processingRequests = new ConcurrentHashMap<>();

    // Manual constructor for proper @Qualifier support
    public AIRecommendedRequestService(
            AIRecommendationRepository aiRecommendationRepository,
            SeniorRequestRepository seniorRequestRepository,
            AIRecommendationMapper mapper,
            @Qualifier("claude") LLMClient llmClient,
            @Qualifier("taskExecutor") Executor asyncExecutor) {
        this.aiRecommendationRepository = aiRecommendationRepository;
        this.seniorRequestRepository = seniorRequestRepository;
        this.mapper = mapper;
        this.llmClient = llmClient;
        this.asyncExecutor = asyncExecutor;
    }

    @Override
    public List<AIRecommendedRequestDto> getAllAIRecommendedRequests() {
        log.info("🔍 getAllAIRecommendedRequests() called - fetching all recommendations");
        List<AIRecommendation> recommendations = aiRecommendationRepository.findAllOrderedByPriority();
        log.info("📊 Found {} recommendations in database", recommendations.size());
        
        // Debug: Log the first few recommendations
        recommendations.stream().limit(3).forEach(rec -> 
            log.info("📝 Sample recommendation: ID={}, RequestId={}, UserId={}, Status={}", 
                rec.getId(), rec.getRequestId(), rec.getUserId(), rec.getStatus())
        );
        
        List<AIRecommendedRequestDto> dtos = recommendations.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        
        log.info("✅ Returning {} DTOs to frontend", dtos.size());
        return dtos;
    }

    @Override
    public List<AIRecommendedRequestDto> getMyAIRecommendedRequests(Long userId) {
        log.info("🔍 getMyAIRecommendedRequests() called for userId: {}", userId);
        List<AIRecommendation> recommendations = aiRecommendationRepository.findByUserId(userId);
        log.info("📊 Found {} recommendations for user {} in database", recommendations.size(), userId);
        
        List<AIRecommendedRequestDto> dtos = recommendations.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        
        log.info("✅ Returning {} DTOs to frontend for user {}", dtos.size(), userId);
        return dtos;
    }

    @Override
    @Async
    @Transactional
    public CompletableFuture<AIRecommendedRequestDto> generateRecommendationAsync(Long requestId) {
        log.info("Generating recommendation for request {} asynchronously", requestId);
        return getOrCreateProcessingFuture(requestId);
    }

    @Override
    @Async
    public CompletableFuture<BatchRecommendationResultDto> processBatchRecommendationsAsync(
            BatchRecommendationRequestDto batchRequest) {

        log.info("Processing {} requests for recommendations with fan-out", batchRequest.getRequestIds().size());

        // Fan out - each request gets its own future (reuses existing if already processing)
        List<CompletableFuture<AIRecommendedRequestDto>> futures = batchRequest.getRequestIds().stream()
                .map(this::getOrCreateProcessingFuture)
                .toList();

        // Combine all results
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> {
                    List<AIRecommendedRequestDto> results = futures.stream()
                            .map(future -> {
                                try {
                                    return future.join();
                                } catch (Exception e) {
                                    log.error("Error processing recommendation request: {}", e.getMessage());
                                    // Create error result using @Data class setters instead of constructor
                                    AIRecommendedRequestDto errorResult = new AIRecommendedRequestDto();
                                    errorResult.setRequestId(null);
                                    errorResult.setUserId(null);
                                    errorResult.setPriorityScore(0);
                                    errorResult.setPriorityReason("Error: " + e.getMessage());
                                    errorResult.setUrgencyLevel("LOW");
                                    errorResult.setRecommendationText("Error generating recommendation");
                                    errorResult.setStatus("FAILED");
                                    errorResult.setUpdatedAt(LocalDateTime.now());
                                    return errorResult;
                                }
                            })
                            .toList();

                    int successCount = results.stream()
                            .mapToInt(result -> "COMPLETED".equals(result.getStatus()) ? 1 : 0)
                            .sum();

                    BatchRecommendationResultDto batchResult = new BatchRecommendationResultDto();
                    batchResult.setRecommendations(results.stream()
                            .filter(r -> "COMPLETED".equals(r.getStatus()))
                            .toList());
                    batchResult.setFailures(results.stream()
                            .filter(r -> "FAILED".equals(r.getStatus()))
                            .toList());
                    batchResult.setTotalProcessed(results.size());
                    batchResult.setSuccessCount(successCount);
                    batchResult.setFailureCount(results.size() - successCount);

                    return batchResult;
                });
    }

    @Override
    @Async
    public CompletableFuture<List<TaskPriorityDto>> rankTaskPrioritiesAsync(List<Long> taskIds) {
        log.info("Ranking {} task priorities", taskIds.size());

        // Fan out pattern for task priorities
        List<CompletableFuture<TaskPriorityDto>> priorityFutures = taskIds.stream()
                .map(this::generateTaskPriorityAsync)
                .collect(Collectors.toList());

        return CompletableFuture.allOf(priorityFutures.toArray(new CompletableFuture[0]))
                .thenApply(v -> priorityFutures.stream()
                        .map(CompletableFuture::join)
                        .sorted((a, b) -> Integer.compare(b.getPriorityScore(), a.getPriorityScore()))
                        .collect(Collectors.toList()));
    }

    private CompletableFuture<AIRecommendedRequestDto> getOrCreateProcessingFuture(Long requestId) {
        // Check if already processing
        CompletableFuture<AIRecommendedRequestDto> existingFuture = processingRequests.get(requestId);
        if (existingFuture != null) {
            log.info("Request {} already being processed for recommendation, reusing future", requestId);
            return existingFuture;
        }

        // Create new processing future
        CompletableFuture<AIRecommendedRequestDto> newFuture = CompletableFuture
                .supplyAsync(() -> processRecommendationRequest(requestId), asyncExecutor)
                .whenComplete((result, throwable) -> {
                    // Clean up when done
                    processingRequests.remove(requestId);
                });

        // Try to register atomically
        CompletableFuture<AIRecommendedRequestDto> registeredFuture = processingRequests.putIfAbsent(requestId, newFuture);

        if (registeredFuture != null) {
            log.info("Another thread registered recommendation request {}, using that future", requestId);
            return registeredFuture;
        }

        return newFuture;
    }

    @Transactional
    protected AIRecommendedRequestDto processRecommendationRequest(Long requestId) {
        Optional<SeniorRequest> requestOpt = seniorRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new IllegalArgumentException("Request not found with ID: " + requestId);
        }
        return performRecommendationGeneration(requestOpt.get());
    }

    private AIRecommendedRequestDto performRecommendationGeneration(SeniorRequest request) {
        // Check if recommendation already exists for this request
        Optional<AIRecommendation> existingRecommendation = aiRecommendationRepository
                .findByRequestId(request.getId());

        if (existingRecommendation.isPresent() &&
                AIRecommendation.ProcessingStatus.COMPLETED.equals(existingRecommendation.get().getStatus())) {
            log.info("Using existing recommendation for request {}", request.getId());
            return mapper.toDto(existingRecommendation.get());
        }

        // Get current user ID from security context
        Long currentUserId = SecurityContextUtil.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("No authenticated user found"));
        log.info("Creating AI recommendation for request {} by user {}", request.getId(), currentUserId);

        // Create or update recommendation record
        AIRecommendation recommendation = existingRecommendation.orElse(new AIRecommendation());
        recommendation.setRequestId(request.getId());
        recommendation.setUserId(currentUserId); // ✅ Set the user ID!
        recommendation.setStatus(AIRecommendation.ProcessingStatus.PROCESSING);
        recommendation.setUpdatedAt(LocalDateTime.now());
        if (recommendation.getId() == null) {
            recommendation.setCreatedAt(LocalDateTime.now());
        }

        aiRecommendationRepository.save(recommendation);

        try {
            // Build prompt and make LLM call
            String prompt = buildRecommendationPrompt(request);
            log.info("Making LLM call for recommendation on request {}", request.getId());
            String llmResponse = llmClient.callLLM(prompt);

            // Parse LLM response and update recommendation
            updateRecommendationFromLLMResponse(recommendation, llmResponse);
            recommendation.setStatus(AIRecommendation.ProcessingStatus.COMPLETED);
            recommendation.setUpdatedAt(LocalDateTime.now());

            AIRecommendation saved = aiRecommendationRepository.save(recommendation);
            log.info("Successfully generated recommendation for request: {}", request.getId());

            return mapper.toDto(saved);

        } catch (Exception e) {
            log.error("Failed to generate recommendation for request: {}", request.getId(), e);

            // Update status to failed
            recommendation.setStatus(AIRecommendation.ProcessingStatus.FAILED);
            // Store error message in priority_reason field since errorMessage field doesn't exist
            recommendation.setPriorityReason("Error: " + e.getMessage());
            recommendation.setUpdatedAt(LocalDateTime.now());
            aiRecommendationRepository.save(recommendation);

            throw new RuntimeException("Failed to generate recommendation", e);
        }
    }

    private String buildRecommendationPrompt(SeniorRequest request) {
        // Build a comprehensive prompt for recommendation generation
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI assistant helping to generate recommendations for senior care requests.\n\n");
        prompt.append("Request Details:\n");
        prompt.append("- ID: ").append(request.getId()).append("\n");
        // Use available properties from SeniorRequest model
        prompt.append("- Title: ").append(request.getTitle()).append("\n");
        prompt.append("- Description: ").append(request.getDescription()).append("\n");

        // Add other available properties if they exist
        if (request.getAssignedStaffId() != null) {
            prompt.append("- Assigned Staff ID: ").append(request.getAssignedStaffId()).append("\n");
        }
        if (request.getSeniorId() != null) {
            prompt.append("- Senior ID: ").append(request.getSeniorId()).append("\n");
        }

        prompt.append("\nPlease provide a JSON response with the following structure:\n");
        prompt.append("{\n");
        prompt.append("  \"recommendation\": \"Your detailed recommendation here\",\n");
        prompt.append("  \"priority_score\": 85,\n");
        prompt.append("  \"urgency_level\": \"HIGH\"\n");
        prompt.append("}\n");

        return prompt.toString();
    }

    private void updateRecommendationFromLLMResponse(AIRecommendation recommendation, String llmResponse) {
        try {
            // Parse the JSON response from LLM
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode responseJson = objectMapper.readTree(llmResponse);

            recommendation.setRecommendationText(responseJson.path("recommendation").asText());
            recommendation.setPriorityScore(responseJson.path("priority_score").asInt(50));
            recommendation.setUrgencyLevel(responseJson.path("urgency_level").asText("MEDIUM"));

        } catch (Exception e) {
            log.warn("Failed to parse LLM response as JSON, using raw response: {}", e.getMessage());
            // Fallback: use raw response as recommendation text
            recommendation.setRecommendationText(llmResponse);
            recommendation.setPriorityScore(50); // Default score
            recommendation.setUrgencyLevel("MEDIUM"); // Default urgency
        }
    }

    private CompletableFuture<TaskPriorityDto> generateTaskPriorityAsync(Long taskId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Build prompt for task priority scoring
                String prompt = buildTaskPriorityPrompt(taskId);
                String llmResponse = llmClient.callLLM(prompt);

                TaskPriorityDto priorityDto = new TaskPriorityDto();
                priorityDto.setTaskId(taskId);

                // Parse LLM response for priority score
                try {
                    com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode responseJson = objectMapper.readTree(llmResponse);
                    priorityDto.setPriorityScore(responseJson.path("priority_score").asInt(50));
                    priorityDto.setPriorityReason(responseJson.path("reasoning").asText());
                } catch (Exception e) {
                    log.warn("Failed to parse priority response, using default score");
                    priorityDto.setPriorityScore(50);
                    priorityDto.setPriorityReason("Unable to parse LLM response");
                }

                return priorityDto;

            } catch (Exception e) {
                log.error("Failed to generate priority for task {}: {}", taskId, e.getMessage());
                TaskPriorityDto errorDto = new TaskPriorityDto();
                errorDto.setTaskId(taskId);
                errorDto.setPriorityScore(0);
                errorDto.setPriorityReason("Error: " + e.getMessage());
                return errorDto;
            }
        }, asyncExecutor);
    }

    private String buildTaskPriorityPrompt(Long taskId) {
        return "Analyze the priority of task ID " + taskId +
                " and provide a JSON response with 'priority_score' (0-100) and 'reasoning' fields.";
    }
}
