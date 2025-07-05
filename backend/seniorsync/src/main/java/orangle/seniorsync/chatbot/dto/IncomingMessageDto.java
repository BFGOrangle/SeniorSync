package orangle.seniorsync.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IncomingMessageDto(
        @NotBlank String campaignName,
        @NotNull Long seniorId,
        @NotBlank ReplyOption replyOption
) {
}
