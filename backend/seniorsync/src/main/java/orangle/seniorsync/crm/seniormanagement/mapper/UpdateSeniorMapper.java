package orangle.seniorsync.crm.seniormanagement.mapper;

import orangle.seniorsync.common.model.CareLevel;
import orangle.seniorsync.common.model.Senior;
import orangle.seniorsync.crm.seniormanagement.dto.UpdateSeniorDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UpdateSeniorMapper {
    
    @Mapping(target = "careLevel", source = "careLevelId")
    void updateExistingSeniorFromDto(UpdateSeniorDto updateSeniorDto, @MappingTarget Senior existingSenior);
    
    default CareLevel mapCareLevelId(Long careLevelId) {
        if (careLevelId == null) {
            return null;
        }
        CareLevel careLevel = new CareLevel();
        careLevel.setId(careLevelId);
        return careLevel;
    }
}