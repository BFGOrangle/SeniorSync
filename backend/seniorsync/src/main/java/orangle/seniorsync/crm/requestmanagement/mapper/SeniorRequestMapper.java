package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class SeniorRequestMapper {

    @Autowired
    protected StaffRepository staffRepository;

    @Mapping(target = "assignedStaffName", source = "assignedStaffId")
    public abstract SeniorRequestDto toDto(SeniorRequest seniorRequest);

    protected String mapAssignedStaffId(Long assignedStaffId) {
        if (assignedStaffId == null) {
            return null;
        }
        return staffRepository.findById(assignedStaffId)
                .map(staff -> staff.getFirstName() + " " + staff.getLastName()) // or however you want to format the name
                .orElse(null);
    }
}