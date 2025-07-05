package orangle.seniorsync.chatbot.dto;

import java.time.OffsetDateTime;

public record MessageDto(
        Long id,
        Long conversationId,
        String direction,
        String content,
        String event,
        OffsetDateTime createdAt
) {
}