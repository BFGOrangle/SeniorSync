package orangle.seniorsync.crm.seniormanagement.mapper;

import orangle.seniorsync.common.model.Senior;
import orangle.seniorsync.crm.seniormanagement.dto.UpdateSeniorDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UpdateSeniorMapper {
    void updateExistingSeniorFromDto(UpdateSeniorDto updateSeniorDto, @MappingTarget Senior existingSenior);
}