package orangle.seniorsync.crm.reminder.service;

import lombok.extern.slf4j.Slf4j;
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
    
    @Value("${seniorsync.email.retry.max-attempts:3}")
    private int maxRetryAttempts;
    
    @Value("${seniorsync.email.retry.delay:1000}")
    private long retryDelay;

    @Override
    public void sendEmail(String to, String subject, String body) {
        executeWithRetry(() -> {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("[SeniorSync Reminder]" + subject);
            message.setText("Hello,\n\nYou have the following reminder:\n\n" + body);

            mailSender.send(message);
            log.info("Email sent successfully via SMTP to {}", to);
        }, "sendEmail", to);
    }

    public void sendTestEmail(String to) {
        String subject = "Test Email from SeniorSync";
        String body = "This is a test email to verify the email service functionality.";
        sendEmail(to, subject, body);
        log.info("Test email sent to {}", to);
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        executeWithRetry(() -> {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to {}", to);
        }, "sendHtmlEmail", to);
    }
    
    /**
     * Executes email operations with retry logic and graceful failure handling
     */
    private void executeWithRetry(EmailOperation operation, String operationType, String recipient) {
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= maxRetryAttempts; attempt++) {
            try {
                operation.execute();
                return; // Success - exit retry loop
            } catch (MailException | MessagingException e) {
                lastException = e;
                log.warn("Failed to {} for recipient {} on attempt {}/{}: {}", 
                    operationType, recipient, attempt, maxRetryAttempts, e.getMessage());
                
                if (attempt < maxRetryAttempts) {
                    try {
                        Thread.sleep(retryDelay * attempt); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Retry delay interrupted for {} to {}", operationType, recipient);
                        return;
                    }
                }
            }
        }
        
        // All attempts failed - log final error but don't throw exception
        log.error("All {} attempts failed for {} to {}. Final error: {}", 
            maxRetryAttempts, operationType, recipient, 
            lastException != null ? lastException.getMessage() : "Unknown error");
    }
    
    @FunctionalInterface
    private interface EmailOperation {
        void execute() throws MailException, MessagingException;
    }
}
