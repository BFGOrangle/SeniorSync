package orangle.seniorsync.crm.staffmanagement.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import orangle.seniorsync.crm.staffmanagement.dto.StaffResponseDto;
import orangle.seniorsync.crm.staffmanagement.model.Staff;

@Mapper(componentModel = "spring")
public interface StaffMapper {
    @Mapping(target = "centerId", source = "center.id")
    @Mapping(target = "centerName", source = "center.name")
    @Mapping(target = "fullName", expression = "java(staff.getFirstName() + \" \" + staff.getLastName())")
    StaffResponseDto toResponseDto(Staff staff);
}
