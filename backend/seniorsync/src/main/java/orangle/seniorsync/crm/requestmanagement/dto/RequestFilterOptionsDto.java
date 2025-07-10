package orangle.seniorsync.crm.requestmanagement.dto;

import java.util.List;

public record RequestFilterOptionsDto(
        List<StaffOptionDto> staffOptions,
        List<RequestTypeOptionDto> requestTypeOptions
) {
} 