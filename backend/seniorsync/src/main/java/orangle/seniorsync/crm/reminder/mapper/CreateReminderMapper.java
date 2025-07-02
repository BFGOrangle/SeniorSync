package orangle.seniorsync.crm.reminder.mapper;

import orangle.seniorsync.crm.reminder.dto.CreateReminderDto;
import orangle.seniorsync.crm.reminder.model.Reminder;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CreateReminderMapper {
    Reminder toEntity(CreateReminderDto createReminderDto);
}
