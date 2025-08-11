package orangle.seniorsync.crm.aifeatures.service;

import orangle.seniorsync.crm.aifeatures.dto.BatchSpamFilterResultDto;
import orangle.seniorsync.crm.aifeatures.dto.SpamFilterResultDto;

import java.util.List;

public interface IAISpamFilterService {
    SpamFilterResultDto checkSingleRequest(Long requestId);
    BatchSpamFilterResultDto checkBatchRequests(List<Long> requestIds);
    List<SpamFilterResultDto> getSpamDetectionHistory();
}
