package orangle.seniorsync.crm.requestmanagement.dto;

import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;

import java.time.OffsetDateTime;

public record SeniorRequestFilterDto(
        RequestStatus status,
        Long seniorId,
        Long assignedStaffId,
        Long requestTypeId,
        Short minPriority,
        Short maxPriority,
        OffsetDateTime createdAfter,
        OffsetDateTime createdBefore
) {
}
