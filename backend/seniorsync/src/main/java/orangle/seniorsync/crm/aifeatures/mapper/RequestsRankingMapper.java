package orangle.seniorsync.crm.aifeatures.mapper;

import orangle.seniorsync.crm.aifeatures.dto.AIRecommendedRequestDto;
import orangle.seniorsync.crm.aifeatures.model.RequestsRanking;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RequestsRankingMapper {
    AIRecommendedRequestDto toDto(RequestsRanking requestsRanking);
}
