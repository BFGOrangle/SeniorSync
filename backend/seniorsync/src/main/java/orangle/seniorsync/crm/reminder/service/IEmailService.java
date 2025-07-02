package orangle.seniorsync.crm.reminder.service;

public interface IEmailService {
    void sendEmail(String to, String subject, String body);
}
