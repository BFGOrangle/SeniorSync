package orangle.seniorsync.crm.aifeatures.service;

import java.util.List;
import orangle.seniorsync.crm.aifeatures.dto.AIRecommendedRequestDto;

public interface IAIRecommendedRequestService {
    AIRecommendedRequestDto getAllAIRecommendedRequests();
    AIRecommendedRequestDto getMyAIRecommendedRequests();
}
