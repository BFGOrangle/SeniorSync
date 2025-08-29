package orangle.seniorsync.crm.requestmanagement.dto;

public record RequestTypeDto(
    Long id,
    String name,
    String description,
    Boolean isGlobal,
    Long centerId
) {}