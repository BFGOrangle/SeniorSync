package orangle.seniorsync.crm.requestmanagement.dto;

import java.time.OffsetDateTime;

public record RequestCommentDto(
        Long id,
        String comment,
        String commentType,
        Long commenterId,
        Long requestId,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
