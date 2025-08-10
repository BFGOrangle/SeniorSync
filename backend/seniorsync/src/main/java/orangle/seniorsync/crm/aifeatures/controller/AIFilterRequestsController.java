package orangle.seniorsync.crm.aifeatures.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.aifeatures.dto.BatchSpamFilterRequestDto;
import orangle.seniorsync.crm.aifeatures.dto.BatchSpamFilterResultDto;
import orangle.seniorsync.crm.aifeatures.dto.SpamFilterResultDto;
import orangle.seniorsync.crm.aifeatures.service.IAISpamFilterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai/filter")
@RequiredArgsConstructor
@Slf4j
public class AIFilterRequestsController {

    private final IAISpamFilterService spamFilterService;

    @PostMapping("/spam/single/{requestId}")
    public ResponseEntity<SpamFilterResultDto> checkSingleRequestForSpam(@PathVariable Long requestId) {
        log.info("Checking single request {} for spam", requestId);
        SpamFilterResultDto result = spamFilterService.checkSingleRequest(requestId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/spam/batch")
    public ResponseEntity<BatchSpamFilterResultDto> checkBatchRequestsForSpam(@RequestBody BatchSpamFilterRequestDto request) {
        log.info("Checking {} requests for spam", request.getRequestIds().size());
        BatchSpamFilterResultDto result = spamFilterService.checkBatchRequests(request.getRequestIds());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/spam/history")
    public ResponseEntity<List<SpamFilterResultDto>> getSpamDetectionHistory() {
        log.info("Retrieving spam detection history");
        List<SpamFilterResultDto> history = spamFilterService.getSpamDetectionHistory();
        return ResponseEntity.ok(history);
    }
}
