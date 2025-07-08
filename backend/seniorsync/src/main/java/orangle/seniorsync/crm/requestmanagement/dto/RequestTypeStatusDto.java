package orangle.seniorsync.crm.requestmanagement.dto;

import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;

public record RequestTypeStatusDto(
        String requestTypeName,
        RequestStatus status,
        Long count
) {
}
