package orangle.seniorsync.crm.aifeatures.controller;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.aifeatures.dto.AIRecommendedRequestDto;
import orangle.seniorsync.crm.aifeatures.service.AIRecommendedRequestService;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/aifeatures/recommend")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class AIRecommendedRequestsController {
    private final AIRecommendedRequestService aiRecommendedRequestService;

    public AIRecommendedRequestsController(AIRecommendedRequestService aiRecommendedRequestService) {
        this.aiRecommendedRequestService = aiRecommendedRequestService;
    }

    @PostMapping("/getAllAIRecommendedRequests")
    public ResponseEntity<List<SeniorRequestDto>> getAllAIRecommendedRequests() {
        AIRecommendedRequestDto aiRecommendedRequests = aiRecommendedRequestService.getAllAIRecommendedRequests();
        log.info("Retrieved {} ai recommended requests", aiRecommendedRequests.rankedRequests().size());
        log.info("Ai recommended requests: {}", aiRecommendedRequests.rankedRequests());
        return ResponseEntity.ok().body(aiRecommendedRequests.rankedRequests());
    }

    @PostMapping("/getMyAIRecommendedRequests")
    public ResponseEntity<List<SeniorRequestDto>> getMyAIRecommendedRequests() {
        AIRecommendedRequestDto aiRecommendedRequests = aiRecommendedRequestService.getMyAIRecommendedRequests();
        log.info("Retrieved {} of my ai recommended requests", aiRecommendedRequests.rankedRequests().size());
        return ResponseEntity.ok().body(aiRecommendedRequests.rankedRequests());
    }
}