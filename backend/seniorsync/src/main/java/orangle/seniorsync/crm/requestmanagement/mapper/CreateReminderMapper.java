package orangle.seniorsync.crm.requestmanagement.mapper;

import orangle.seniorsync.crm.requestmanagement.dto.CreateReminderDto;
import orangle.seniorsync.crm.requestmanagement.model.Reminder;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CreateReminderMapper {
    Reminder toEntity(CreateReminderDto createReminderDto);
}
