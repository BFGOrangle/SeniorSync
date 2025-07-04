package orangle.seniorsync.crm.seniormanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpdateSeniorDto(
        @NotNull Long id,
        @NotBlank String firstName,
        @NotBlank String lastName,
        LocalDate dateOfBirth,
        String contactPhone,
        String contactEmail,
        String address
) {
}