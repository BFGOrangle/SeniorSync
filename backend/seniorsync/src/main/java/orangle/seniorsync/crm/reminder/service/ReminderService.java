package orangle.seniorsync.crm.reminder.service;

import orangle.seniorsync.crm.reminder.dto.CreateReminderDto;
import orangle.seniorsync.crm.reminder.dto.ReminderDto;
import orangle.seniorsync.crm.reminder.dto.UpdateReminderDto;
import orangle.seniorsync.crm.reminder.mapper.CreateReminderMapper;
import orangle.seniorsync.crm.reminder.mapper.ReminderMapper;
import orangle.seniorsync.crm.reminder.mapper.UpdateReminderMapper;
import orangle.seniorsync.crm.reminder.model.Reminder;
import orangle.seniorsync.crm.reminder.repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReminderService implements IReminderService {

    private final ReminderRepository reminderRepository;
    private final ReminderMapper reminderMapper;
    private final CreateReminderMapper createReminderMapper;
    private final UpdateReminderMapper updateReminderMapper;
    private final INotificationService notificationService;

    public ReminderService(ReminderRepository reminderRepository, ReminderMapper reminderMapper, CreateReminderMapper createReminderMapper, UpdateReminderMapper updateReminderMapper, INotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.reminderMapper = reminderMapper;
        this.createReminderMapper = createReminderMapper;
        this.updateReminderMapper = updateReminderMapper;
        this.notificationService = notificationService;
    }

    @Override
    public List<ReminderDto> findReminders(Long requestId) {
        List<Reminder> reminders;
        if (requestId == null) {
            reminders = reminderRepository.findAll();
        } else {
            reminders = reminderRepository.findByRequestId(requestId);
        }
        return reminders.stream()
                .map(reminderMapper::toDto)
                .toList();
    }

    /**
     * Creates a new reminder based on the provided DTO.
     * Maps the DTO to an entity, saves it to the repository, and returns the created request as a DTO.
     * Also sends an email notification to the assigned staff member.
     *
     * @param createReminderDto the DTO containing the details of the reminder to be created
     * @return the created ReminderDto
     */
    @Override
    public ReminderDto createReminder(CreateReminderDto createReminderDto) {
        Reminder reminderToCreate = createReminderMapper.toEntity(createReminderDto);
        Reminder createdReminder = reminderRepository.save(reminderToCreate);
        
        // Send notification email if reminder is assigned to a staff member (async)
        if (createdReminder.getStaffAssigneeId() != null) {
            notificationService.notifyReminderCreationAsync(createdReminder);
        }
        
        return reminderMapper.toDto(createdReminder);
    }

    @Override
    public ReminderDto updateReminder(UpdateReminderDto updateReminderDto) {
        Reminder reminderToUpdate = reminderRepository.findById(updateReminderDto.id())
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found with id: " + updateReminderDto.id()));

        updateReminderMapper.updateExistingReminderFromDto(updateReminderDto, reminderToUpdate);

        Reminder updatedReminder = reminderRepository.save(reminderToUpdate);
        return reminderMapper.toDto(updatedReminder);
    }

    public void deleteReminder(long id) {
        Reminder existingReminder = reminderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));
        reminderRepository.delete(existingReminder);
    }
}
