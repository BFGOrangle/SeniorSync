package orangle.seniorsync.crm.reminder.dto;

import java.time.OffsetDateTime;

public record ReminderDto(
        Long id,
        String title,
        String description,
        OffsetDateTime reminderDate,
        Long requestId,
        Long staffAssigneeId,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
