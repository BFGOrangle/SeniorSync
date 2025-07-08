package orangle.seniorsync.crm.reminder.controller;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.reminder.service.EmailService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/email")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class EmailController {
    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/test")
    public String testEmail(@RequestBody String email) {
        log.info("Received email for testing: {}", email);
        try {
            emailService.sendTestEmail(email);
            log.info("Test email sent successfully to: {}", email);
            return "Test email sent successfully to: " + email;
        } catch (Exception e) {
            log.error("Failed to send test email to {}: {}", email, e.getMessage());
            return "Failed to send test email to: " + email;
        }
    }
}
