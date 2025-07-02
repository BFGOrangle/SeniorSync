package orangle.seniorsync.crm.reminder.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.reminder.model.Reminder;
import orangle.seniorsync.crm.reminder.repository.ReminderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class DailyReminderService implements IDailyReminderService{
    private final IEmailService emailService;
    private final ReminderRepository reminderRepository;

    public DailyReminderService(IEmailService emailService, ReminderRepository reminderRepository) {
        this.emailService = emailService;
        this.reminderRepository = reminderRepository;
    }
    @Scheduled(cron = "0 0 8 * * ?") // Runs daily at 8:00 AM
    public void sendDailyReminders() {
        // Logic to send daily reminders
        OffsetDateTime startOfDay = OffsetDateTime.now().toLocalDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);

        // Find reminders for the entire day
        List<Reminder> remindersDueToday = reminderRepository.findByReminderDateBetween(startOfDay, endOfDay);
        log.info("Found {} reminders due today", remindersDueToday.size());
        for (Reminder reminder : remindersDueToday) {
            // Send email notification for each reminder
            // Placeholder email until auth is set up
            emailService.sendEmail("jitthing617@gmail.com", reminder.getDescription(), reminder.getTitle());
            log.info("Sent reminder email for reminder ID: {}", reminder.getId());
        }
    }
}
