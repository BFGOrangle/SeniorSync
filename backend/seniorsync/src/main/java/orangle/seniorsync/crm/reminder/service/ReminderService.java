package orangle.seniorsync.crm.reminder.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.reminder.dto.CreateReminderDto;
import orangle.seniorsync.crm.reminder.dto.ReminderDto;
import orangle.seniorsync.crm.reminder.dto.UpdateReminderDto;
import orangle.seniorsync.crm.reminder.mapper.CreateReminderMapper;
import orangle.seniorsync.crm.reminder.mapper.ReminderMapper;
import orangle.seniorsync.crm.reminder.mapper.UpdateReminderMapper;
import orangle.seniorsync.crm.reminder.model.Reminder;
import orangle.seniorsync.crm.reminder.repository.ReminderRepository;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class ReminderService implements IReminderService {

    private final ReminderRepository reminderRepository;
    private final ReminderMapper reminderMapper;
    private final CreateReminderMapper createReminderMapper;
    private final UpdateReminderMapper updateReminderMapper;
    private final INotificationService notificationService;
    private final QuartzReminderSchedulerService schedulerService;
    private final StaffRepository staffRepository;
    private final IEmailService emailService;

    public ReminderService(ReminderRepository reminderRepository, 
                          ReminderMapper reminderMapper, 
                          CreateReminderMapper createReminderMapper, 
                          UpdateReminderMapper updateReminderMapper, 
                          INotificationService notificationService,
                          QuartzReminderSchedulerService schedulerService,
                          StaffRepository staffRepository,
                          IEmailService emailService) {
        this.reminderRepository = reminderRepository;
        this.reminderMapper = reminderMapper;
        this.createReminderMapper = createReminderMapper;
        this.updateReminderMapper = updateReminderMapper;
        this.notificationService = notificationService;
        this.schedulerService = schedulerService;
        this.staffRepository = staffRepository;
        this.emailService = emailService;
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
     * Maps the DTO to an entity, saves it to the repository, schedules it with Quartz,
     * and returns the created request as a DTO.
     * Also sends an email notification to the assigned staff member.
     *
     * @param createReminderDto the DTO containing the details of the reminder to be created
     * @return the created ReminderDto
     */
    @Override
    public ReminderDto createReminder(CreateReminderDto createReminderDto) {
        Reminder reminderToCreate = createReminderMapper.toEntity(createReminderDto);
        Reminder createdReminder = reminderRepository.save(reminderToCreate);
        
        // Schedule the reminder with Quartz
        schedulerService.scheduleReminder(createdReminder);
        
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
        
        // Reschedule the reminder with updated time
        schedulerService.rescheduleReminder(updatedReminder);
        
        return reminderMapper.toDto(updatedReminder);
    }

    @Override
    public void deleteReminder(long id) {
        Reminder existingReminder = reminderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found with ID: " + id));
        
        // Cancel the scheduled job before deleting
        schedulerService.cancelReminder(id);
        
        reminderRepository.delete(existingReminder);
    }

    /**
     * Sends a reminder notification for a specific reminder ID.
     * This method is called by the Quartz job when a reminder is due.
     *
     * @param reminderId the ID of the reminder to send
     */
    public void sendReminderById(Long reminderId) {
        reminderRepository.findById(reminderId).ifPresentOrElse(reminder -> {
            log.info("Sending reminder notification for reminder ID: {}", reminder.getId());
            notificationService.notifyReminderTriggered(reminder);
        }, () -> {
            log.warn("Reminder with ID {} not found. It may have been deleted.", reminderId);
        });
    }
}
