package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.crm.requestmanagement.dto.RequestCommentDto;
import orangle.seniorsync.crm.requestmanagement.model.RequestComment;
import orangle.seniorsync.crm.requestmanagement.service.RequestMappingService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class RequestCommentMapper {
    
    @Autowired
    protected RequestMappingService requestMappingService;

    @Mapping(target = "commenterName", source = "commenterId", qualifiedByName = "mapCommenterName")
    public abstract RequestCommentDto toDto(RequestComment requestComment);

    @org.mapstruct.Named("mapCommenterName")
    protected String mapCommenterName(Long commenterId) {
        return requestMappingService.getStaffName(commenterId);
    }
}
