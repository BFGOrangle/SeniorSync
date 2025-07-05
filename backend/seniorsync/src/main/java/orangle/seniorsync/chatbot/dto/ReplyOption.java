package orangle.seniorsync.chatbot.dto;

import jakarta.validation.constraints.NotBlank;

public record ReplyOption(
        @NotBlank String text,
        @NotBlank String fsmEvent
) {
}
