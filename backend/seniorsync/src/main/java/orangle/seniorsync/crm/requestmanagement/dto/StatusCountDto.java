package orangle.seniorsync.crm.requestmanagement.dto;

import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;

public record StatusCountDto(
        RequestStatus status,
        Long count
) {
}
