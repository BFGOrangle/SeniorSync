package orangle.seniorsync.crm.reminder.dto;

import java.time.OffsetDateTime;

public record UpdateReminderDto(
        Long id,
        String title,
        String description,
        OffsetDateTime reminderDate,
        Long staffAssigneeId
) {
}
