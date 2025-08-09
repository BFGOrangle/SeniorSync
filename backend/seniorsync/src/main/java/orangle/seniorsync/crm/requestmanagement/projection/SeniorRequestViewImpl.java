package orangle.seniorsync.crm.requestmanagement.projection;

import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;

import java.time.OffsetDateTime;

/**
 * Simple record implementation of SeniorRequestView for use when we need to create
 * view objects from entities (e.g., when center filtering requires entity-based queries).
 */
public record SeniorRequestViewImpl(
        Long id,
        Long seniorId,
        Long assignedStaffId,
        Long requestTypeId,
        String title,
        String description,
        Short priority,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime completedAt,
        RequestStatus status
) implements SeniorRequestView {
    
    @Override
    public Long getId() { return id; }
    
    @Override
    public Long getSeniorId() { return seniorId; }
    
    @Override
    public Long getAssignedStaffId() { return assignedStaffId; }
    
    @Override
    public Long getRequestTypeId() { return requestTypeId; }
    
    @Override
    public String getTitle() { return title; }
    
    @Override
    public String getDescription() { return description; }
    
    @Override
    public Short getPriority() { return priority; }
    
    @Override
    public OffsetDateTime getCreatedAt() { return createdAt; }
    
    @Override
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    
    @Override
    public OffsetDateTime getCompletedAt() { return completedAt; }
    
    @Override
    public RequestStatus getStatus() { return status; }
}
