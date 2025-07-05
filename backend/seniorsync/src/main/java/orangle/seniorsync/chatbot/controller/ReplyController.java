package orangle.seniorsync.chatbot.controller;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.IncomingMessageDto;
import orangle.seniorsync.chatbot.dto.ReplyDto;
import orangle.seniorsync.chatbot.service.IReplyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/chatbot")
public class ReplyController {

    private final IReplyService replyService;

    public ReplyController(IReplyService replyService) {
        this.replyService = replyService;
    }

    @PostMapping("/reply")
    public ResponseEntity<ReplyDto> replyMessage(@RequestBody IncomingMessageDto incomingMessage) {
        ReplyDto replyDto = replyService.replyMessage(
                incomingMessage.campaignName(),
                incomingMessage.seniorId(),
                incomingMessage.replyOption()
        );
        log.info("Replying with message to senior_id: {}", replyDto.senior_id());
        return ResponseEntity.ok(replyDto);
    }
}
