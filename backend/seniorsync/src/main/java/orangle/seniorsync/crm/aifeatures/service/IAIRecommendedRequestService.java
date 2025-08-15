package orangle.seniorsync.crm.aifeatures.service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import orangle.seniorsync.crm.aifeatures.dto.AIRecommendedRequestDto;
import orangle.seniorsync.crm.aifeatures.dto.BatchRecommendationRequestDto;
import orangle.seniorsync.crm.aifeatures.dto.BatchRecommendationResultDto;
import orangle.seniorsync.crm.aifeatures.dto.TaskPriorityDto;

public interface IAIRecommendedRequestService {
    List<AIRecommendedRequestDto> getAllAIRecommendedRequests();
    List<AIRecommendedRequestDto> getMyAIRecommendedRequests(Long userId);

    // Single recommendation
    CompletableFuture<AIRecommendedRequestDto> generateRecommendationAsync(Long requestId);

    // Batch processing with priorities
    CompletableFuture<BatchRecommendationResultDto> processBatchRecommendationsAsync(
            BatchRecommendationRequestDto batchRequest);

    // Priority ranking
    CompletableFuture<List<TaskPriorityDto>> rankTaskPrioritiesAsync(List<Long> taskIds);
}
