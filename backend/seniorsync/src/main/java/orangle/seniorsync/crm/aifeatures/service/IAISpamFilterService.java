package orangle.seniorsync.crm.aifeatures.service;

import orangle.seniorsync.crm.aifeatures.dto.BatchSpamFilterResultDto;
import orangle.seniorsync.crm.aifeatures.dto.SpamFilterResultDto;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface IAISpamFilterService {
    CompletableFuture<SpamFilterResultDto> checkSingleRequestAsync(Long requestId);
    CompletableFuture<BatchSpamFilterResultDto> checkBatchRequestsAsync(List<Long> requestIds);
    List<SpamFilterResultDto> getSpamDetectionHistory();
}
