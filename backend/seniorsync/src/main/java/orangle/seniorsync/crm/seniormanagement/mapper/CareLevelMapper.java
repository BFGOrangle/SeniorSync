package orangle.seniorsync.crm.seniormanagement.mapper;

import orangle.seniorsync.common.model.CareLevel;
import orangle.seniorsync.crm.seniormanagement.dto.CareLevelDto;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CareLevelMapper {
    CareLevelDto toDto(CareLevel careLevel);
}
