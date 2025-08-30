package orangle.seniorsync.crm.reminder.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.reminder.repository.ReminderRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Slf4j
@Service
public class DailyReminderService {
    
    private final ReminderRepository reminderRepository;
    private final QuartzReminderSchedulerService schedulerService;

    public DailyReminderService(ReminderRepository reminderRepository, 
                               QuartzReminderSchedulerService schedulerService) {
        this.reminderRepository = reminderRepository;
        this.schedulerService = schedulerService;
    }

    /**
     * Re-schedule existing reminders on application startup.
     * This ensures that reminders scheduled before application restart
     * are properly rescheduled in Quartz.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void rescheduleExistingReminders() {
        log.info("Rescheduling existing future reminders on application startup");
        
        var futureReminders = reminderRepository.findByReminderDateAfter(OffsetDateTime.now());
        log.info("Found {} future reminders to reschedule", futureReminders.size());
        
        futureReminders.forEach(reminder -> {
            if (!schedulerService.isReminderScheduled(reminder.getId())) {
                schedulerService.scheduleReminder(reminder);
                log.debug("Rescheduled reminder ID: {} for {}", reminder.getId(), reminder.getReminderDate());
            } else {
                log.debug("Reminder ID: {} is already scheduled", reminder.getId());
            }
        });
        
        log.info("Completed rescheduling existing reminders");
    }
}
