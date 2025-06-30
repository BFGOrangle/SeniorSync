package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.crm.requestmanagement.dto.UpdateSeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UpdateSeniorRequestMapper {
    void updateExitingSeniorRequestFromDto(UpdateSeniorRequestDto updateSeniorRequestDto, @MappingTarget SeniorRequest existingSeniorRequest);
}
