package orangle.seniorsync.crm.seniormanagement.mapper;

import orangle.seniorsync.common.model.CareLevel;
import orangle.seniorsync.crm.seniormanagement.dto.UpdateCareLevelDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UpdateCareLevelMapper {
    void updateExistingCareLevelFromDto(UpdateCareLevelDto updateCareLevelDto, @MappingTarget CareLevel existingCareLevel);
}

