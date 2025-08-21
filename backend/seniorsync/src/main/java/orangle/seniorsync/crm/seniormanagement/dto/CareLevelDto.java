package orangle.seniorsync.crm.seniormanagement.dto;

import jakarta.validation.constraints.NotBlank;

public record CareLevelDto(
   @NotBlank String careLevel,
    @NotBlank String careLevelColour
) {
}
