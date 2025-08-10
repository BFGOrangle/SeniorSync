package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.service.RequestMappingService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class SeniorRequestMapper {

    @Autowired
    protected RequestMappingService requestMappingService;

    @Mapping(target = "assignedStaffName", source = "assignedStaffId", qualifiedByName = "mapStaffName")
    @Mapping(target = "isSpam", source = "id", qualifiedByName = "mapSpamStatus")
    @Mapping(target = "spamConfidenceScore", source = "id", qualifiedByName = "mapSpamConfidence") 
    @Mapping(target = "spamDetectionReason", source = "id", qualifiedByName = "mapSpamReason")
    @Mapping(target = "spamDetectedAt", source = "id", qualifiedByName = "mapSpamDetectedAt")
    public abstract SeniorRequestDto toDto(SeniorRequest seniorRequest);

    @org.mapstruct.Named("mapStaffName")
    protected String mapStaffName(Long assignedStaffId) {
        return requestMappingService.getStaffName(assignedStaffId);
    }
    
    @org.mapstruct.Named("mapSpamStatus")
    protected Boolean mapSpamStatus(Long requestId) {
        return requestMappingService.getSpamStatus(requestId);
    }
    
    @org.mapstruct.Named("mapSpamConfidence")
    protected BigDecimal mapSpamConfidence(Long requestId) {
        return requestMappingService.getSpamConfidence(requestId);
    }
    
    @org.mapstruct.Named("mapSpamReason")
    protected String mapSpamReason(Long requestId) {
        return requestMappingService.getSpamReason(requestId);
    }
    
    @org.mapstruct.Named("mapSpamDetectedAt")
    protected OffsetDateTime mapSpamDetectedAt(Long requestId) {
        return requestMappingService.getSpamDetectedAt(requestId);
    }
}