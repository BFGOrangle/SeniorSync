package orangle.seniorsync.crm.aifeatures.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.aifeatures.dto.BatchSpamFilterRequestDto;
import orangle.seniorsync.crm.aifeatures.dto.BatchSpamFilterResultDto;
import orangle.seniorsync.crm.aifeatures.dto.SpamFilterResultDto;
import orangle.seniorsync.crm.aifeatures.service.IAISpamFilterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/aifeatures/spam-filter")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class AIFilterRequestsController {

    private final IAISpamFilterService spamFilterService;

    @PostMapping("/check/{requestId}")
    public CompletableFuture<ResponseEntity<SpamFilterResultDto>> checkRequestAsync(@PathVariable Long requestId) {
        return spamFilterService.checkSingleRequestAsync(requestId)
                .thenApply(result -> ResponseEntity.ok(result))
                .exceptionally(ex -> ResponseEntity.badRequest().build());
    }

    @PostMapping("/check-batch")
    public CompletableFuture<ResponseEntity<BatchSpamFilterResultDto>> checkBatchRequestsAsync(@RequestBody List<Long> requestIds) {
        return spamFilterService.checkBatchRequestsAsync(requestIds)
                .thenApply(result -> ResponseEntity.ok(result))
                .exceptionally(ex -> ResponseEntity.badRequest().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<SpamFilterResultDto>> getSpamDetectionHistory() {
        log.info("Retrieving spam detection history");
        List<SpamFilterResultDto> history = spamFilterService.getSpamDetectionHistory();
        return ResponseEntity.ok(history);
    }
}
