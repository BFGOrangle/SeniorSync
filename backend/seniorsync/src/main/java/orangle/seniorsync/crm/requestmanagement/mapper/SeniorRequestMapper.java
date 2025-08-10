package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.common.repository.StaffRepository;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.RequestTypeRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class SeniorRequestMapper {

    @Autowired
    protected StaffRepository staffRepository;

    @Autowired
    protected RequestTypeRepository requestTypeRepository;

    @Mapping(target = "assignedStaffName", source = "assignedStaffId", qualifiedByName = "mapAssignedStaffIdToName")
    @Mapping(target = "requestTypeName", source = "requestTypeId", qualifiedByName = "mapRequestTypeIdToName")
    public abstract SeniorRequestDto toDto(SeniorRequest seniorRequest);

    @Named("mapAssignedStaffIdToName")
    protected String mapAssignedStaffId(Long assignedStaffId) {
        if (assignedStaffId == null) {
            return null;
        }
        return staffRepository.findById(assignedStaffId)
                .map(staff -> staff.getFirstName() + " " + staff.getLastName())
                .orElse(null);
    }

    @Named("mapRequestTypeIdToName")
    protected String mapRequestTypeId(Long requestTypeId) {
        if (requestTypeId == null) {
            return null;
        }
        return requestTypeRepository.findById(requestTypeId)
                .map(rt -> rt.getName())
                .orElse(null);
    }
}