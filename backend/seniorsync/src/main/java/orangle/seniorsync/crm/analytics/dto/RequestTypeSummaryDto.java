package orangle.seniorsync.crm.analytics.dto;

public record RequestTypeSummaryDto(
    Long id,
    String name,
    String description,
    Long count,
    Double percentage,
    Long pendingCount,
    Long inProgressCount,
    Long completedCount
) {} 