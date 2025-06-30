package orangle.seniorsync.crm.requestmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateSeniorRequestDto(
        @NotNull Long seniorId,
        @NotNull Integer requestTypeId,
        @NotBlank String title,
        @NotBlank String description,
        @NotNull Short priority
) {
}