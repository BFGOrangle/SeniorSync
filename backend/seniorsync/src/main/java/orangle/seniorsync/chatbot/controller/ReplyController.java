package orangle.seniorsync.chatbot.controller;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.ReplyDto;
import orangle.seniorsync.chatbot.service.IReplyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/chatbot")
public class ReplyController {

    private final IReplyService replyService;

    public ReplyController(IReplyService replyService) {
        this.replyService = replyService;
    }

    @PostMapping("/reply/{seniorId}")
    public ResponseEntity<ReplyDto> replyMessage(@PathVariable long seniorId) {
        String campaignName = "seniorRequestLodgingCampaign";
        ReplyDto replyDto = replyService.replyMessage(campaignName, seniorId);
        log.info("Replying with message to senior_id: {}", replyDto.senior_id());
        return ResponseEntity.ok(replyDto);
    }
}
