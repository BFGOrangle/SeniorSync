package orangle.seniorsync.crm.requestmanagement.dto;

import java.time.OffsetDateTime;

public record ReminderDto(
        Long id,
        String title,
        String description,
        OffsetDateTime reminderDate,
        Long requestId,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
