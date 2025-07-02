package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.crm.requestmanagement.dto.CreateReminderDto;
import orangle.seniorsync.crm.requestmanagement.dto.ReminderDto;
import orangle.seniorsync.crm.requestmanagement.dto.UpdateReminderDto;

import java.util.List;

public interface IReminderService {
    ReminderDto createReminder(CreateReminderDto createReminderDto);
    List<ReminderDto> findReminders(Long requestId);
    ReminderDto updateReminder(UpdateReminderDto updateReminderDto);
    void deleteReminder(long id);
}
