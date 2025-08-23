package orangle.seniorsync.crm.seniormanagement.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreateSeniorDto(
        @NotBlank String firstName,
        @NotBlank String lastName,
        LocalDate dateOfBirth,
        String contactPhone,
        String contactEmail,
        String address,
        Long careLevelId,
        String[] characteristics
) {
}