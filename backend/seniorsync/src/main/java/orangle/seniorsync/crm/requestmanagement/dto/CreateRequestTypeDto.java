package orangle.seniorsync.crm.requestmanagement.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record CreateRequestTypeDto (
    @NotEmpty
    String name,
    @NotEmpty
    String description,

    @NotNull
    Long centerId
) {}
