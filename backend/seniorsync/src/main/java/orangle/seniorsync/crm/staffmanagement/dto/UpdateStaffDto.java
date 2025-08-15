package orangle.seniorsync.crm.staffmanagement.dto;

import jakarta.validation.constraints.Email;
import orangle.seniorsync.common.model.RoleType;

/**
 * DTO for updating an existing staff member
 */
public record UpdateStaffDto(
    Long centerId,
    String firstName,
    String lastName,
    String jobTitle,
    String contactPhone,
    @Email String contactEmail,
    RoleType roleType
) {}
