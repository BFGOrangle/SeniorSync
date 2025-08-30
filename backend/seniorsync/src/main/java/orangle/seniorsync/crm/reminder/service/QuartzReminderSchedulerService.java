package orangle.seniorsync.crm.reminder.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.reminder.job.ReminderJob;
import orangle.seniorsync.crm.reminder.model.Reminder;
import org.quartz.*;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Date;

@Slf4j
@Service
public class QuartzReminderSchedulerService {
    
    private final Scheduler scheduler;

    public QuartzReminderSchedulerService(Scheduler scheduler) {
        this.scheduler = scheduler;
    }

    public void scheduleReminder(Reminder reminder) {
        try {
            String jobName = "reminder-job-" + reminder.getId();
            String groupName = "reminder-group";

            JobDetail jobDetail = JobBuilder.newJob(ReminderJob.class)
                    .withIdentity(jobName, groupName)
                    .usingJobData("reminderId", reminder.getId())
                    .build();

            // Convert OffsetDateTime to Date for Quartz
            Date triggerTime = Date.from(reminder.getReminderDate().toInstant());

            // Check if the reminder time is in the past
            if (triggerTime.before(new Date())) {
                log.warn("Reminder date is in the past for reminder ID: {}. Skipping scheduling.", reminder.getId());
                return;
            }

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity("reminder-trigger-" + reminder.getId(), groupName)
                    .startAt(triggerTime)
                    .build();

            scheduler.scheduleJob(jobDetail, trigger);
            log.info("Scheduled reminder job for reminder ID: {} at {}", reminder.getId(), reminder.getReminderDate());

        } catch (SchedulerException e) {
            log.error("Failed to schedule reminder job for reminder ID: {}", reminder.getId(), e);
        }
    }

    public void cancelReminder(Long reminderId) {
        try {
            String jobName = "reminder-job-" + reminderId;
            String groupName = "reminder-group";
            JobKey jobKey = JobKey.jobKey(jobName, groupName);
            
            boolean deleted = scheduler.deleteJob(jobKey);
            if (deleted) {
                log.info("Cancelled reminder job for reminder ID: {}", reminderId);
            } else {
                log.warn("No job found to cancel for reminder ID: {}", reminderId);
            }
        } catch (SchedulerException e) {
            log.error("Failed to cancel reminder job for reminder ID: {}", reminderId, e);
        }
    }

    public void rescheduleReminder(Reminder reminder) {
        cancelReminder(reminder.getId());
        scheduleReminder(reminder);
    }

    public boolean isReminderScheduled(Long reminderId) {
        try {
            String jobName = "reminder-job-" + reminderId;
            String groupName = "reminder-group";
            JobKey jobKey = JobKey.jobKey(jobName, groupName);
            return scheduler.checkExists(jobKey);
        } catch (SchedulerException e) {
            log.error("Failed to check if reminder job exists for reminder ID: {}", reminderId, e);
            return false;
        }
    }
}
