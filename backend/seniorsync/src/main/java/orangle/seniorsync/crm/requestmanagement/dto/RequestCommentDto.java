package orangle.seniorsync.crm.requestmanagement.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record RequestCommentDto(
        Long id,
        String comment,
        String commentType,
        Long commenterId,
        Long requestId,
        String commenterName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<Long> mentionedStaffIds,
        List<MentionedStaffDto> mentionedStaff
) {
}
