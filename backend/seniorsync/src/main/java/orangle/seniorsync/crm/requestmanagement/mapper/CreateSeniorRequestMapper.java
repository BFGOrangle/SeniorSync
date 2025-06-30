package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.crm.requestmanagement.dto.CreateSeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

// Why use MapStruct? Read `MappingStrategies.md` at `backend/knowledge/MappingStrategies.md`
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CreateSeniorRequestMapper {
    SeniorRequest toEntity(CreateSeniorRequestDto createSeniorRequestDto);
}