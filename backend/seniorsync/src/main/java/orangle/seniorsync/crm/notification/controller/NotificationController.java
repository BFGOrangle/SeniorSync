package orangle.seniorsync.crm.notification.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.notification.dto.MentionNotificationRequest;
import orangle.seniorsync.crm.notification.dto.NotificationResponse;
import orangle.seniorsync.crm.notification.service.IMentionNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
@RequiredArgsConstructor
public class NotificationController {
    
    private final IMentionNotificationService mentionNotificationService;
    
    /**
     * Send mention notifications to specified staff members
     * 
     * @param mentionRequest The mention notification request
     * @return Response indicating success/failure of notifications
     */
    @PostMapping("/mentions")
    public ResponseEntity<NotificationResponse> sendMentionNotifications(
            @Valid @RequestBody MentionNotificationRequest mentionRequest) {
        
        log.info("Received mention notification request for comment {} with {} staff members", 
                mentionRequest.getCommentId(), mentionRequest.getMentionedStaffIds().size());
        
        try {
            NotificationResponse response = mentionNotificationService.sendMentionNotifications(mentionRequest);
            
            if (response.isSuccess()) {
                log.info("Successfully sent {} mention notifications for comment {}", 
                        response.getEmailsSent(), mentionRequest.getCommentId());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Failed to send mention notifications for comment {}: {}", 
                        mentionRequest.getCommentId(), response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error processing mention notification request: {}", e.getMessage(), e);
            NotificationResponse errorResponse = NotificationResponse.failure(
                "Failed to send mention notifications: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}