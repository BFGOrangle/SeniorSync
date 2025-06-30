package orangle.seniorsync.crm.seniormanagement.mapper;

import orangle.seniorsync.common.model.Senior;
import orangle.seniorsync.crm.seniormanagement.dto.SeniorDto;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SeniorMapper {
    SeniorDto toDto(Senior senior);
}