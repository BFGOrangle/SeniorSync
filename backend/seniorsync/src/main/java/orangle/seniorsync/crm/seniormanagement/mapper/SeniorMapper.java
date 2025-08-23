package orangle.seniorsync.crm.seniormanagement.mapper;

import orangle.seniorsync.common.model.CareLevel;
import orangle.seniorsync.common.model.Senior;
import orangle.seniorsync.crm.seniormanagement.dto.SeniorDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SeniorMapper {
    
    @Mapping(target = "careLevelId", source = "careLevel")
    SeniorDto toDto(Senior senior);
    
    default Long mapCareLevel(CareLevel careLevel) {
        return careLevel != null ? careLevel.getId() : null;
    }
}