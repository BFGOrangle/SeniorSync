package orangle.seniorsync.crm.requestmanagement.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for assigning requests to staff members
 * Used for both assignment and reassignment operations
 */
public record AssignRequestDto(
        @NotNull Long assignedStaffId
) {
} 