package orangle.seniorsync.chatbot.dto;

import java.time.OffsetDateTime;

public record ConversationDto(
        Long id,
        Long seniorId,
        String campaignName,
        String currentState,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}