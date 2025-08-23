package orangle.seniorsync.crm.seniormanagement.mapper;

import orangle.seniorsync.common.model.CareLevel;
import orangle.seniorsync.crm.seniormanagement.dto.CreateCareLevelDto;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CreateCareLevelMapper {
    CareLevel toEntity(CreateCareLevelDto createCareLevelDto);
}
