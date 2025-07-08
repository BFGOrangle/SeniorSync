package orangle.seniorsync.crm.requestmanagement.dto;

import java.util.List;

public record DashboardDto(
        Long totalRequests,
        Long pendingRequests,
        Long completedThisMonth,
        Double avgCompletionTimeDays,

        List<StatusCountDto> statusCountDto,
        List<StringCountDto> requestTypeCounts,
        List<ShortCountDto> priorityCounts,
        List<StringCountDto> monthlyCounts,
        List<StringCountDto> staffWorkloadCounts,
        List<RequestTypeStatusDto> requestTypeStatusCounts
) {
}
