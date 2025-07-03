package orangle.seniorsync.crm.reminder.service;

import orangle.seniorsync.crm.reminder.dto.CreateReminderDto;
import orangle.seniorsync.crm.reminder.dto.ReminderDto;
import orangle.seniorsync.crm.reminder.dto.UpdateReminderDto;

import java.util.List;

public interface IReminderService {
    ReminderDto createReminder(CreateReminderDto createReminderDto);
    List<ReminderDto> findReminders(Long requestId);
    ReminderDto updateReminder(UpdateReminderDto updateReminderDto);
    void deleteReminder(long id);
}
