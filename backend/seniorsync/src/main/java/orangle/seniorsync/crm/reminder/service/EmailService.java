package orangle.seniorsync.crm.reminder.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

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
            message.setSubject("[SeniorSync Reminder]" + subject);
            message.setText("Hello,\n\nYou have the following reminder:\n\n" + body);

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

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("HTML email sent to {}", to);
        } catch (MailException | MessagingException e) {
            log.error("Failed to send HTML email to {}", to, e);
            throw new RuntimeException("HTML email sending failed", e);
        }
    }
}
