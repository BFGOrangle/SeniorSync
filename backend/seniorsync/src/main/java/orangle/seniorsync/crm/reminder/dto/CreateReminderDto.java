package orangle.seniorsync.crm.reminder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record CreateReminderDto(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull Long requestId,
        @NotNull OffsetDateTime reminderDate,
        Long staffAssigneeId
) {
}
