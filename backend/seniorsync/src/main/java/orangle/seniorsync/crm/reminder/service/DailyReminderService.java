package orangle.seniorsync.crm.reminder.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import orangle.seniorsync.crm.reminder.model.Reminder;
import orangle.seniorsync.crm.reminder.repository.ReminderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
public class DailyReminderService implements IDailyReminderService{
    private final IEmailService emailService;
    private final ReminderRepository reminderRepository;
    private final StaffRepository staffRepository;

    public DailyReminderService(IEmailService emailService, ReminderRepository reminderRepository, StaffRepository staffRepository) {
        this.emailService = emailService;
        this.reminderRepository = reminderRepository;
        this.staffRepository = staffRepository;
    }
    @Scheduled(cron = "0 0 8 * * ?") // Runs daily at 8:00 AM
    public void sendDailyReminders() {
        // Logic to send daily reminders
        OffsetDateTime startOfDay = OffsetDateTime.now(java.time.ZoneId.of("Asia/Singapore"))
            .toLocalDate()
            .atStartOfDay(java.time.ZoneId.of("Asia/Singapore"))
            .toOffsetDateTime();
        OffsetDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);

        // Find reminders for the entire day
        List<Reminder> remindersDueToday = reminderRepository.findByReminderDateBetween(startOfDay, endOfDay);
        log.info("Found {} reminders due today", remindersDueToday.size());
        for (Reminder reminder : remindersDueToday) {
            // Send email notification for each reminder
            /*
            * function to get email by assignee staff id
            * placeholder for now, assuming email is hardcoded
            * */
            String staffEmail = staffRepository.findById(reminder.getStaffAssigneeId())
                    .map(Staff::getContactEmail)
                    .orElse("");
            if (staffEmail == null || staffEmail.isEmpty()) {
                log.warn("No valid email found for staff assignee ID: {}. Skipping email for reminder ID: {}", 
                        reminder.getStaffAssigneeId(), reminder.getId());
                continue;
            }
            emailService.sendEmail(staffEmail, reminder.getTitle(), reminder.getDescription());
            log.info("Sent reminder email for reminder ID: {}", reminder.getId());
        }
    }
}
