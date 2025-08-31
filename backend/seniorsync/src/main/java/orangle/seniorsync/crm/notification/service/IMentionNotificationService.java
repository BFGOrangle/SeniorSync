package orangle.seniorsync.crm.notification.service;

import orangle.seniorsync.crm.notification.dto.MentionNotificationRequest;
import orangle.seniorsync.crm.notification.dto.NotificationResponse;

import java.util.concurrent.CompletableFuture;

public interface IMentionNotificationService {
    
    /**
     * Send mention notifications to all mentioned staff members asynchronously
     * @param mentionRequest The mention notification request containing details
     * @return CompletableFuture that completes with the notification result
     */
    CompletableFuture<NotificationResponse> sendMentionNotificationsAsync(MentionNotificationRequest mentionRequest);
    
    /**
     * Send mention notifications to all mentioned staff members synchronously
     * @param mentionRequest The mention notification request containing details
     * @return NotificationResponse with details about success/failures
     */
    NotificationResponse sendMentionNotifications(MentionNotificationRequest mentionRequest);
}