package orangle.seniorsync.crm.reminder.service;

import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.reminder.model.Reminder;
import java.util.concurrent.CompletableFuture;

public interface INotificationService {
    
    /**
     * Send assignment notification when a request is assigned to a staff member (async)
     * @param request The request that was assigned
     * @param assignedStaffId The staff member who was assigned
     * @return CompletableFuture that completes when notification is sent
     */
    CompletableFuture<Void> notifyRequestAssignmentAsync(SeniorRequest request, Long assignedStaffId);
    
    /**
     * Send notification when a reminder is created and assigned to a staff member (async)
     * @param reminder The reminder that was created
     * @return CompletableFuture that completes when notification is sent
     */
    CompletableFuture<Void> notifyReminderCreationAsync(Reminder reminder);
    
    /**
     * Send unassignment notification when a request is unassigned from a staff member (async)
     * @param request The request that was unassigned
     * @param previousAssigneeId The staff member who was previously assigned
     * @return CompletableFuture that completes when notification is sent
     */
    CompletableFuture<Void> notifyRequestUnassignmentAsync(SeniorRequest request, Long previousAssigneeId);
    
    // Keep synchronous methods for backwards compatibility
    /**
     * Send assignment notification when a request is assigned to a staff member
     * @param request The request that was assigned
     * @param assignedStaffId The staff member who was assigned
     */
    void notifyRequestAssignment(SeniorRequest request, Long assignedStaffId);
    
    /**
     * Send notification when a reminder is created and assigned to a staff member
     * @param reminder The reminder that was created
     */
    void notifyReminderCreation(Reminder reminder);
    
    /**
     * Send notification when a request assignment is removed
     * @param request The request that was unassigned
     * @param previousStaffId The staff member who was previously assigned
     */
    void notifyRequestUnassignment(SeniorRequest request, Long previousStaffId);
    
    /**
     * Send reminder notification when a scheduled reminder is triggered
     * @param reminder The reminder to send notification for
     */
    void notifyReminderTriggered(Reminder reminder);
}
