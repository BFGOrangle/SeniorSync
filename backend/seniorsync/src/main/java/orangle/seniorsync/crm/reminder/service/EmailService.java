package orangle.seniorsync.crm.reminder.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService implements IEmailService{
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent successfully via Hostinger SMTP to {}", to);

        } catch (MailException e) {
            log.error("Failed to send email via Hostinger SMTP to {}", to, e);
            throw new RuntimeException("Email sending failed", e);
        }
    }

    public void sendTestEmail(String to) {
        String subject = "Test Email from SeniorSync";
        String body = "This is a test email to verify the email service functionality.";
        sendEmail(to, subject, body);
        log.info("Test email sent to {}", to);
    }
}
