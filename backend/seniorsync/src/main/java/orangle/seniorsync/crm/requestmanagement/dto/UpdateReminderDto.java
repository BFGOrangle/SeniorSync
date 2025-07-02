package orangle.seniorsync.crm.requestmanagement.dto;

import java.time.OffsetDateTime;

public record UpdateReminderDto(
        Long id,
        String title,
        String description,
        OffsetDateTime reminderDate
) {
}
