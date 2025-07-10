package orangle.seniorsync.chatbot.dto;

import jakarta.validation.constraints.NotBlank;

public record ReplyOption(
        @NotBlank String displayText,
        @NotBlank String value,
        @NotBlank String fsmEvent
) {
}
