package orangle.seniorsync.crm.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.notification.dto.MentionNotificationRequest;
import orangle.seniorsync.crm.notification.dto.NotificationResponse;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;
import orangle.seniorsync.crm.reminder.service.EmailService;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentionNotificationService implements IMentionNotificationService {
    
    private final EmailService emailService;
    private final StaffRepository staffRepository;
    private final SeniorRequestRepository requestRepository;
    
    @Value("${seniorsync.app.base-url:https://seniorsync.sg}")
    private String appBaseUrl;
    
    @Override
    @Async
    public CompletableFuture<NotificationResponse> sendMentionNotificationsAsync(MentionNotificationRequest mentionRequest) {
        log.info("Processing mention notifications asynchronously for comment {} with {} mentioned staff", 
                mentionRequest.getCommentId(), mentionRequest.getMentionedStaffIds().size());
        
        NotificationResponse response = sendMentionNotifications(mentionRequest);
        return CompletableFuture.completedFuture(response);
    }
    
    @Override
    public NotificationResponse sendMentionNotifications(MentionNotificationRequest mentionRequest) {
        log.info("Processing mention notifications for comment {} with {} mentioned staff", 
                mentionRequest.getCommentId(), mentionRequest.getMentionedStaffIds().size());
        
        List<String> failedEmails = new ArrayList<>();
        int successCount = 0;
        
        // Get request details for email context
        Optional<SeniorRequest> requestOpt = requestRepository.findById(mentionRequest.getRequestId());
        if (requestOpt.isEmpty()) {
            log.warn("Request {} not found for mention notification", mentionRequest.getRequestId());
            return NotificationResponse.failure("Request not found");
        }
        
        SeniorRequest request = requestOpt.get();
        String requestUrl = appBaseUrl + "/requests/" + request.getId();
        
        // Send email to each mentioned staff member
        for (Long staffId : mentionRequest.getMentionedStaffIds()) {
            try {
                Optional<Staff> staffOpt = staffRepository.findById(staffId);
                if (staffOpt.isEmpty()) {
                    log.warn("Staff member {} not found for mention notification", staffId);
                    failedEmails.add("Staff ID " + staffId + " (not found)");
                    continue;
                }
                
                Staff staff = staffOpt.get();
                String email = staff.getContactEmail();
                
                if (email == null || email.trim().isEmpty()) {
                    log.warn("No email address found for staff member {}", staffId);
                    failedEmails.add(staff.getFullName() + " (no email)");
                    continue;
                }
                
                // Send mention notification email
                sendMentionEmail(staff, mentionRequest, request, requestUrl);
                successCount++;
                
                log.debug("Sent mention notification to {} ({})", staff.getFullName(), email);
                
            } catch (Exception e) {
                log.error("Failed to send mention notification to staff {}: {}", staffId, e.getMessage());
                failedEmails.add("Staff ID " + staffId + " (error: " + e.getMessage() + ")");
            }
        }
        
        log.info("Mention notification summary: {} sent, {} failed", successCount, failedEmails.size());
        
        if (failedEmails.isEmpty()) {
            return NotificationResponse.success(successCount);
        } else {
            return NotificationResponse.partialSuccess(successCount, failedEmails);
        }
    }
    
    private void sendMentionEmail(Staff staff, MentionNotificationRequest mentionRequest, 
                                 SeniorRequest request, String requestUrl) {
        String subject = String.format("You were mentioned in a comment - Request #%d", request.getId());
        
        String textBody = buildMentionEmailText(staff, mentionRequest, request, requestUrl);
        
        emailService.sendEmail(staff.getContactEmail(), subject, textBody);
    }
    
    private String buildMentionEmailText(Staff staff, MentionNotificationRequest mentionRequest, 
                                        SeniorRequest request, String requestUrl) {
        return String.format("""
            Hi %s,
            
            %s mentioned you in a comment on request #%d:
            
            Request: %s
            Comment by: %s
            
            "%s"
            
            View the full request and respond at: %s
            
            ---
            This notification was sent because you were mentioned using @ in a comment.
            SeniorSync CRM System - Supporting our seniors with care
            """,
            staff.getFullName(),
            mentionRequest.getCommenterName(),
            request.getId(),
            request.getTitle() != null ? request.getTitle() : "Request #" + request.getId(),
            mentionRequest.getCommenterName(),
            mentionRequest.getCommentText(),
            requestUrl
        );
    }
}