package orangle.seniorsync.chatbot.controller;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.IncomingMessageDto;
import orangle.seniorsync.chatbot.dto.ReplyDto;
import orangle.seniorsync.chatbot.dto.ReplyOption;
import orangle.seniorsync.chatbot.service.IReplyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/chatbot")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class ReplyController {

    private final IReplyService replyService;

    public ReplyController(IReplyService replyService) {
        this.replyService = replyService;
    }

    @PostMapping("/reply")
    public ResponseEntity<ReplyDto> replyMessage(
            @RequestBody IncomingMessageDto incomingMessage,
            @RequestParam(defaultValue = "en") String languageCode) {
        ReplyDto replyDto = replyService.replyMessage(
                incomingMessage.campaignName(),
                incomingMessage.seniorId(),
                incomingMessage.replyOption(),
                languageCode
        );
        log.info("Replying with message to senior_id: {}", replyDto.senior_id());
        return ResponseEntity.ok(replyDto);
    }

    @GetMapping("/senior/{seniorId}/current-reply-response")
    public ResponseEntity<ReplyDto> getCurrentReplyResponse(
            @PathVariable Long seniorId,
            @RequestParam(defaultValue = "lodging_request") String campaignName,
            @RequestParam(defaultValue = "en") String languageCode) {
        ReplyDto replyResponse = replyService.getCurrentReplyResponse(campaignName, seniorId, languageCode);
        log.info("Retrieving current reply response (prompt and reply options) for senior_id: {}", seniorId);
        return ResponseEntity.ok(replyResponse);
    }
}
