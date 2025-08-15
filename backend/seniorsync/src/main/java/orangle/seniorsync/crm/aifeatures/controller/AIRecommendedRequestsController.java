package orangle.seniorsync.crm.aifeatures.controller;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.aifeatures.dto.AIRecommendedRequestDto;
import orangle.seniorsync.crm.aifeatures.dto.BatchRecommendationRequestDto;
import orangle.seniorsync.crm.aifeatures.dto.BatchRecommendationResultDto;
import orangle.seniorsync.crm.aifeatures.dto.TaskPriorityDto;
import orangle.seniorsync.crm.aifeatures.service.AIRecommendedRequestService;
import orangle.seniorsync.crm.aifeatures.service.IAIRecommendedRequestService;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/aifeatures/recommend")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class AIRecommendedRequestsController {

    private final AIRecommendedRequestService aiRecommendedRequestService;

    public AIRecommendedRequestsController(AIRecommendedRequestService aiRecommendedRequestService) {
        this.aiRecommendedRequestService = aiRecommendedRequestService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<AIRecommendedRequestDto>> getAllRecommendations() {
        return ResponseEntity.ok(aiRecommendedRequestService.getAllAIRecommendedRequests());
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<AIRecommendedRequestDto>> getMyRecommendations(@PathVariable Long userId) {
        return ResponseEntity.ok(aiRecommendedRequestService.getMyAIRecommendedRequests(userId));
    }

    @PostMapping("/generate/{requestId}")
    public CompletableFuture<ResponseEntity<AIRecommendedRequestDto>> generateRecommendation(
            @PathVariable Long requestId) {
        return aiRecommendedRequestService.generateRecommendationAsync(requestId)
                .thenApply(ResponseEntity::ok);
    }

    @PostMapping("/batch")
    public CompletableFuture<ResponseEntity<BatchRecommendationResultDto>> processBatchRecommendations(
            @RequestBody BatchRecommendationRequestDto batchRequest) {
        return aiRecommendedRequestService.processBatchRecommendationsAsync(batchRequest)
                .thenApply(ResponseEntity::ok);
    }

    @PostMapping("/priorities")
    public CompletableFuture<ResponseEntity<List<TaskPriorityDto>>> rankTaskPriorities(
            @RequestBody List<Long> taskIds) {
        return aiRecommendedRequestService.rankTaskPrioritiesAsync(taskIds)
                .thenApply(ResponseEntity::ok);
    }
}
