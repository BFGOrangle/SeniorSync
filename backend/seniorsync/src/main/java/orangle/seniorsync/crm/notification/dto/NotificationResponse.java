package orangle.seniorsync.crm.notification.dto;

import java.util.List;

public class NotificationResponse {
    private boolean success;
    private String message;
    private int emailsSent;
    private List<String> failedEmails;
    
    public NotificationResponse(boolean success, String message, int emailsSent, List<String> failedEmails) {
        this.success = success;
        this.message = message;
        this.emailsSent = emailsSent;
        this.failedEmails = failedEmails;
    }
    
    // Getters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public int getEmailsSent() { return emailsSent; }
    public List<String> getFailedEmails() { return failedEmails; }
    
    public static NotificationResponse success(int emailsSent) {
        return new NotificationResponse(true, "Mention notifications sent successfully", emailsSent, List.of());
    }
    
    public static NotificationResponse partialSuccess(int emailsSent, List<String> failedEmails) {
        String message = String.format("Sent %d notifications, %d failed", emailsSent, failedEmails.size());
        return new NotificationResponse(true, message, emailsSent, failedEmails);
    }
    
    public static NotificationResponse failure(String error) {
        return new NotificationResponse(false, error, 0, List.of());
    }
}