package orangle.seniorsync.crm.requestmanagement.dto;

import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;

import java.time.OffsetDateTime;

public record SeniorRequestDto(
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
        RequestStatus status,
        String assignedStaffName,
        String requestTypeName
) {
}