package orangle.seniorsync.chatbot.dto;

import java.util.List;

public record ReplyDto(
        Long message_id,
        Long senior_id,
        String message_content,
        List<ReplyOption> replyOptions
) {
}
