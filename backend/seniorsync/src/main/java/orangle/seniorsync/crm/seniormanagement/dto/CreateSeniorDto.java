package orangle.seniorsync.crm.seniormanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record CreateSeniorDto(
        @NotBlank String firstName,
        @NotBlank String lastName,
        LocalDate dateOfBirth,
        String contactPhone,
        String contactEmail,
        String address,
        String careLevel,
        @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Care level color must be a valid hex color code (e.g., #FF0000 or #F00)")
        String careLevelColor,
        String[] characteristics
) {
}