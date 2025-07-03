package orangle.seniorsync.crm.reminder.mapper;

import orangle.seniorsync.crm.reminder.dto.UpdateReminderDto;
import orangle.seniorsync.crm.reminder.model.Reminder;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface UpdateReminderMapper {
    void updateExistingReminderFromDto(UpdateReminderDto updateReminderDto, @MappingTarget Reminder existingReminder);
}
