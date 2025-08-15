package orangle.seniorsync.crm.aifeatures.dto;

import java.util.List;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;

public record AIRecommendedRequestDto(
        List<SeniorRequestDto> rankedRequests
) {

}