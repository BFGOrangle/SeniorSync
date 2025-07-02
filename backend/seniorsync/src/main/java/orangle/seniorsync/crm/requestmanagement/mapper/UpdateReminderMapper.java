package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.crm.requestmanagement.dto.UpdateReminderDto;
import orangle.seniorsync.crm.requestmanagement.model.Reminder;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface UpdateReminderMapper {
    void updateExistingReminderFromDto(UpdateReminderDto updateReminderDto, @MappingTarget Reminder existingReminder);
}
