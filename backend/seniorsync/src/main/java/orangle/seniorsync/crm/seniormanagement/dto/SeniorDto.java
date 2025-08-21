package orangle.seniorsync.crm.seniormanagement.dto;

import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record SeniorDto(
        Long id,
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        String contactPhone,
        String contactEmail,
        String address,
        Long careLevelId,
        String[] characteristics,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt

) {
}