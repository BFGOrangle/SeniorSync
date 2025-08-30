package orangle.seniorsync.crm.reminder.job;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.reminder.service.ReminderService;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ReminderJob implements Job {

    @Autowired
    private ReminderService reminderService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap dataMap = context.getJobDetail().getJobDataMap();
        Long reminderId = dataMap.getLong("reminderId");
        
        log.info("Executing reminder job for reminder ID: {}", reminderId);
        
        try {
            reminderService.sendReminderById(reminderId);
        } catch (Exception e) {
            log.error("Failed to send reminder for ID: {}", reminderId, e);
            throw new JobExecutionException(e);
        }
    }
}
