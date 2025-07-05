package orangle.seniorsync.crm.requestmanagement.dto;

import jakarta.validation.constraints.NotNull;

public record CreateCommentDto(
        @NotNull Long requestId,
        @NotNull String comment,
        @NotNull String commentType,
        @NotNull Long commenterId
) {
}
