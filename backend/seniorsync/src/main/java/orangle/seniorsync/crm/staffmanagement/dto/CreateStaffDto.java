package orangle.seniorsync.crm.staffmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import orangle.seniorsync.common.model.RoleType;

/**
 * DTO for creating a new staff member
 * New staff members are always active by default
 */
public record CreateStaffDto(
    @NotBlank
    String firstName,

    @NotBlank
    String lastName,

    @NotBlank
    String jobTitle,

    String contactPhone,

    @NotBlank
    @Email
    String contactEmail,

    @NotBlank
    String password,

    @NotNull
    RoleType roleType
) {
}
