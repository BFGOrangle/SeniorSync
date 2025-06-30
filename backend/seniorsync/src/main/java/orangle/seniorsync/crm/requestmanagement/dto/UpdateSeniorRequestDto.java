package orangle.seniorsync.crm.requestmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;

public record UpdateSeniorRequestDto(
        @NotNull Long id,
        @NotBlank String title,
        @NotBlank String description,
        @NotNull Short priority,
        @NotNull RequestStatus status,
        Long assignedStaffId,
        Long requestTypeId
) {
}