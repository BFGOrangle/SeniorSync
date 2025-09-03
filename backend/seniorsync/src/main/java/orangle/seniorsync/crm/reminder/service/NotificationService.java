package orangle.seniorsync.crm.reminder.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.reminder.model.Reminder;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import orangle.seniorsync.common.model.Senior;
import orangle.seniorsync.crm.seniormanagement.repository.SeniorRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService implements INotificationService {
    
    private final EmailService emailService;
    private final StaffRepository staffRepository;
    private final SeniorRepository seniorRepository;
    
    @Value("${seniorsync.app.base-url:https://seniorsync.sg}")
    private String appBaseUrl;

    private ZoneOffset utcPlus8Offset = ZoneOffset.ofHours(8);

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy 'at' HH:mm");
    
    @Override
    public void notifyRequestAssignment(SeniorRequest request, Long assignedStaffId) {
        log.info("Sending assignment notification for request {} to staff {}", request.getId(), assignedStaffId);
        
        Optional<Staff> staffOpt = staffRepository.findById(assignedStaffId);
        if (staffOpt.isEmpty()) {
            log.warn("Staff member with ID {} not found. Cannot send assignment notification.", assignedStaffId);
            return;
        }
        
        Staff staff = staffOpt.get();
        String email = staff.getContactEmail();
        
        if (email == null || email.trim().isEmpty()) {
            log.warn("No email address found for staff member {}. Cannot send assignment notification.", assignedStaffId);
            return;
        }
        
        // Get senior information
        String seniorName = "Unknown Senior";
        if (request.getSeniorId() != null) {
            Optional<Senior> seniorOpt = seniorRepository.findById(request.getSeniorId());
            if (seniorOpt.isPresent()) {
                Senior senior = seniorOpt.get();
                seniorName = senior.getFirstName();
            }
        }
        
        String subject = "New Request Assigned: " + request.getTitle();
        String htmlBody =  buildRequestAssignmentHtml(staff.getFullName(), request, seniorName, staff);
        
        try {
            emailService.sendHtmlEmail(email, subject, htmlBody);
            log.info("Assignment notification sent successfully to {}", email);
        } catch (Exception e) {
            log.error("Failed to send assignment notification to {}: {}", email, e.getMessage(), e);
        }
    }
    
    @Override
    public void notifyReminderCreation(Reminder reminder) {
        if (reminder.getStaffAssigneeId() == null) {
            log.debug("Reminder {} has no assigned staff. Skipping notification.", reminder.getId());
            return;
        }
        
        log.info("Sending reminder creation notification for reminder {} to staff {}", 
                reminder.getId(), reminder.getStaffAssigneeId());
        
        Optional<Staff> staffOpt = staffRepository.findById(reminder.getStaffAssigneeId());
        if (staffOpt.isEmpty()) {
            log.warn("Staff member with ID {} not found. Cannot send reminder notification.", reminder.getStaffAssigneeId());
            return;
        }
        
        Staff staff = staffOpt.get();
        String email = staff.getContactEmail();
        
        if (email == null || email.trim().isEmpty()) {
            log.warn("No email address found for staff member {}. Cannot send reminder notification.", reminder.getStaffAssigneeId());
            return;
        }
        
        String subject = "New Reminder: " + reminder.getTitle();
        String htmlBody = buildReminderCreationHtml(staff.getFullName(), reminder, staff);
        
        try {
            emailService.sendHtmlEmail(email, subject, htmlBody);
            log.info("Reminder notification sent successfully to {}", email);
        } catch (Exception e) {
            log.error("Failed to send reminder notification to {}: {}", email, e.getMessage());
            // Note: EmailService now handles failures gracefully, so this catch is mainly for unexpected errors
        }
    }
    
    @Override
    public void notifyRequestUnassignment(SeniorRequest request, Long previousStaffId) {
        log.info("Sending unassignment notification for request {} to staff {}", request.getId(), previousStaffId);
        
        Optional<Staff> staffOpt = staffRepository.findById(previousStaffId);
        if (staffOpt.isEmpty()) {
            log.warn("Staff member with ID {} not found. Cannot send unassignment notification.", previousStaffId);
            return;
        }
        
        Staff staff = staffOpt.get();
        String email = staff.getContactEmail();
        
        if (email == null || email.trim().isEmpty()) {
            log.warn("No email address found for staff member {}. Cannot send unassignment notification.", previousStaffId);
            return;
        }
        
        String subject = "Request Unassigned: " + request.getTitle();
        String htmlBody = buildRequestUnassignmentHtml(staff.getFullName(), request);
        
        try {
            emailService.sendHtmlEmail(email, subject, htmlBody);
            log.info("Unassignment notification sent successfully to {}", email);
        } catch (Exception e) {
            log.error("Failed to send unassignment notification to {}: {}", email, e.getMessage(), e);
        }
    }
    
    private String buildRequestAssignmentHtml(String staffName, SeniorRequest request, String seniorName, Staff staff) {
        String rolePath = determineRolePath(staff);
        String requestUrl = appBaseUrl + rolePath + "/requests/" + request.getId();
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>New Request Assignment</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
                    .badge { background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                    .priority-high { background-color: #dc2626; }
                    .priority-medium { background-color: #f59e0b; }
                    .priority-low { background-color: #16a34a; }
                    .info-box { background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb; }
                    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎯 New Request Assigned</h1>
                        <p>You have been assigned a new request in SeniorSync</p>
                    </div>
                    
                    <h2>Hello %s,</h2>
                    <p>A new request has been assigned to you. Please review the details below:</p>
                    
                    <div class="info-box">
                        <h3>📋 Request Details</h3>
                        <p><strong>Title:</strong> %s</p>
                        <p><strong>Description:</strong> %s</p>
                        <p><strong>Senior:</strong> %s</p>
                        <p><strong>Priority:</strong> <span class="badge priority-%s">%s</span></p>
                        <p><strong>Status:</strong> %s</p>
                        <p><strong>Request ID:</strong> #%d</p>
                    </div>
                    
                    <p>Please log into SeniorSync to review and handle this request promptly.</p>
                    
                    <a href="%s" class="button">📱 View Request in SeniorSync</a>
                    
                    <div class="footer">
                        <p>This is an automated notification from SeniorSync.</p>
                        <p>If you believe this email was sent in error, please contact your administrator.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            staffName,
            escapeHtml(request.getTitle()),
            escapeHtml(request.getDescription()),
            escapeHtml(seniorName),
            getPriorityClass(request.getPriority()),
            getPriorityLabel(request.getPriority()),
            request.getStatus().toString(),
            request.getId(),
            requestUrl
        );
    }
    
    private String buildReminderCreationHtml(String staffName, Reminder reminder, Staff staff) {
        String reminderDate = reminder.getReminderDate()
                .withOffsetSameInstant(utcPlus8Offset)
                .format(DATE_FORMATTER);
        String rolePath = determineRolePath(staff);
        String dashboardUrl = appBaseUrl + rolePath + "/dashboard";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>New Reminder Created</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
                    .info-box { background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #059669; }
                    .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                    .date-highlight { background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ New Reminder Created</h1>
                        <p>A reminder has been set for you in SeniorSync</p>
                    </div>
                    
                    <h2>Hello %s,</h2>
                    <p>A new reminder has been created and assigned to you. Please review the details below:</p>
                    
                    <div class="info-box">
                        <h3>📝 Reminder Details</h3>
                        <p><strong>Title:</strong> %s</p>
                        <p><strong>Description:</strong> %s</p>
                        <p><strong>Reminder Date:</strong> <span class="date-highlight">%s</span></p>
                        <p><strong>Reminder ID:</strong> #%d</p>
                    </div>
                    
                    <p>Please make sure to complete this task by the specified date and time.</p>
                    
                    <a href="%s" class="button">📱 View in SeniorSync</a>
                    
                    <div class="footer">
                        <p>This is an automated notification from SeniorSync.</p>
                        <p>You will receive a reminder email at the scheduled time.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            staffName,
            escapeHtml(reminder.getTitle()),
            escapeHtml(reminder.getDescription()),
            reminderDate,
            reminder.getId(),
            dashboardUrl
        );
    }
    
    private String buildRequestUnassignmentHtml(String staffName, SeniorRequest request) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Request Unassigned</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
                    .info-box { background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc2626; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ Request Unassigned</h1>
                        <p>A request has been unassigned from you</p>
                    </div>
                    
                    <h2>Hello %s,</h2>
                    <p>The following request has been unassigned from you:</p>
                    
                    <div class="info-box">
                        <h3>📋 Request Details</h3>
                        <p><strong>Title:</strong> %s</p>
                        <p><strong>Description:</strong> %s</p>
                        <p><strong>Request ID:</strong> #%d</p>
                    </div>
                    
                    <p>You are no longer responsible for handling this request. If you have any questions, please contact your administrator.</p>
                    
                    <div class="footer">
                        <p>This is an automated notification from SeniorSync.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            staffName,
            escapeHtml(request.getTitle()),
            escapeHtml(request.getDescription()),
            request.getId()
        );
    }
    
    private String buildReminderTriggeredHtml(String staffName, Reminder reminder, Staff staff) {
        String reminderDate = reminder.getReminderDate()
                .withOffsetSameInstant(utcPlus8Offset)
                .format(DATE_FORMATTER);
        String rolePath = determineRolePath(staff);
        String dashboardUrl = appBaseUrl + rolePath + "/dashboard";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reminder Alert</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
                    .alert-box { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
                    .button { display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                    .time-highlight { background-color: #dc2626; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
                    .urgent { background-color: #fef2f2; border-left-color: #dc2626; }
                    .urgent .time-highlight { background-color: #dc2626; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Reminder Alert</h1>
                        <p>It's time for your scheduled reminder!</p>
                    </div>
                    
                    <h2>Hello %s,</h2>
                    <p>This is your scheduled reminder notification. Please review the details below and take the necessary action:</p>
                    
                    <div class="alert-box urgent">
                        <h3>⚠️ Action Required</h3>
                        <p><strong>Title:</strong> %s</p>
                        <p><strong>Description:</strong> %s</p>
                        <p><strong>Scheduled Time:</strong> <span class="time-highlight">%s</span></p>
                        <p><strong>Reminder ID:</strong> #%d</p>
                    </div>
                    
                    <p>Please ensure you complete this task promptly. If you've already completed it, you can mark it as done in SeniorSync.</p>
                    
                    <a href="%s" class="button">📱 Open SeniorSync Dashboard</a>
                    
                    <div class="footer">
                        <p>This is an automated reminder from SeniorSync.</p>
                        <p>If you believe this reminder was sent in error, please contact your administrator.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            staffName,
            escapeHtml(reminder.getTitle()),
            escapeHtml(reminder.getDescription()),
            reminderDate,
            reminder.getId(),
            dashboardUrl
        );
    }
    
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#x27;");
    }
    
    private String getPriorityClass(Short priority) {
        if (priority == null) return "low";
        if (priority >= 7) return "high";
        if (priority >= 4) return "medium";
        return "low";
    }
    
    private String getPriorityLabel(Short priority) {
        if (priority == null) return "Low";
        if (priority >= 7) return "High";
        if (priority >= 4) return "Medium";
        return "Low";
    }
    
    /**
     * Determines the role-based path prefix for URLs based on staff role
     * @param staff The staff member
     * @return "/admin" for admin users, "/staff" for regular staff
     */
    private String determineRolePath(Staff staff) {
        if (staff.isAdmin()) {
            return "/admin";
        }
        return "/staff";
    }
    
    // Async implementations
    
    @Override
    @Async
    public CompletableFuture<Void> notifyRequestAssignmentAsync(SeniorRequest request, Long assignedStaffId) {
        try {
            notifyRequestAssignment(request, assignedStaffId);
        } catch (Exception e) {
            log.error("Failed to send async assignment notification for request {} to staff {}: {}", 
                request.getId(), assignedStaffId, e.getMessage(), e);
        }
        return CompletableFuture.completedFuture(null);
    }
    
    @Override
    @Async
    public CompletableFuture<Void> notifyReminderCreationAsync(Reminder reminder) {
        try {
            notifyReminderCreation(reminder);
        } catch (Exception e) {
            log.error("Failed to send async reminder creation notification for reminder {}: {}", 
                reminder.getId(), e.getMessage(), e);
        }
        return CompletableFuture.completedFuture(null);
    }
    
    @Override
    @Async
    public CompletableFuture<Void> notifyRequestUnassignmentAsync(SeniorRequest request, Long previousAssigneeId) {
        try {
            notifyRequestUnassignment(request, previousAssigneeId);
        } catch (Exception e) {
            log.error("Failed to send async unassignment notification for request {} to previous staff {}: {}", 
                request.getId(), previousAssigneeId, e.getMessage(), e);
        }
        return CompletableFuture.completedFuture(null);
    }
    
    @Override
    public void notifyReminderTriggered(Reminder reminder) {
        log.info("Sending reminder notification for reminder {} to staff {}", 
            reminder.getId(), reminder.getStaffAssigneeId());
        
        Optional<Staff> staffOpt = staffRepository.findById(reminder.getStaffAssigneeId());
        if (staffOpt.isEmpty()) {
            log.warn("Staff not found for reminder notification. Staff ID: {}, Reminder ID: {}", 
                reminder.getStaffAssigneeId(), reminder.getId());
            return;
        }
        
        Staff staff = staffOpt.get();
        String email = staff.getContactEmail();
        
        if (email == null || email.trim().isEmpty()) {
            log.warn("No valid email found for staff {}. Skipping reminder notification for reminder ID: {}", 
                staff.getId(), reminder.getId());
            return;
        }
        
        String subject = "⏰ Reminder: " + reminder.getTitle();
        String htmlBody = buildReminderTriggeredHtml(staff.getFullName(), reminder, staff);
        
        try {
            emailService.sendHtmlEmail(email, subject, htmlBody);
            log.info("Reminder notification sent successfully to {}", email);
        } catch (Exception e) {
            log.error("Failed to send reminder notification to {}: {}", email, e.getMessage(), e);
        }
    }
}
