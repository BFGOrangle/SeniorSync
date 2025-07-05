package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.crm.requestmanagement.dto.RequestCommentDto;
import orangle.seniorsync.crm.requestmanagement.model.RequestComment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RequestCommentMapper {
    @Mapping(target = "requestId", source = "request.id")
    RequestCommentDto toDto(RequestComment requestComment);
}
