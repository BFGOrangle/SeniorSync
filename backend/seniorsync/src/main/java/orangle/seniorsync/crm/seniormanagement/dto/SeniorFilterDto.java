package orangle.seniorsync.crm.seniormanagement.dto;

import java.time.LocalDate;

public record SeniorFilterDto(
        String firstName,
        String lastName,
        LocalDate minDateOfBirth,
        LocalDate maxDateOfBirth,
        String contactPhone,
        String contactEmail
) {
}