package orangle.seniorsync.crm.requestmanagement.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateCommentDto(
        @NotNull Long requestId,
        @NotNull String comment,
        @NotNull String commentType,
        @NotNull Long commenterId,
        List<Long> mentionedStaffIds
) {
}
