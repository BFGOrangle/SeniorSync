package orangle.seniorsync.chatbot.controller;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.ConversationDto;
import orangle.seniorsync.chatbot.dto.MessageDto;
import orangle.seniorsync.chatbot.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/chatbot/messages")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageDto>> getMessagesByConversation(@PathVariable Long conversationId) {
        List<MessageDto> messages = messageService.getMessagesByConversationId(conversationId);
        log.info("Retrieved {} messages for conversation {}", messages.size(), conversationId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/senior/{seniorId}")
    public ResponseEntity<List<MessageDto>> getMessagesBySenior(
            @PathVariable Long seniorId,
            @RequestParam(defaultValue = "lodging_request") String campaignName) {
        List<MessageDto> messages = messageService.getMessagesBySeniorAndCampaign(seniorId, campaignName);
        log.info("Retrieved {} messages for senior {} in campaign {}", messages.size(), seniorId, campaignName);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/senior/{seniorId}/active-conversation")
    public ResponseEntity<ConversationDto> getActiveConversation(
            @PathVariable Long seniorId,
            @RequestParam(defaultValue = "lodging_request") String campaignName) {
        return messageService.getActiveConversation(seniorId, campaignName)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/conversation/{conversationId}/clear")
    public ResponseEntity<Void> clearConversationMessages(@PathVariable Long conversationId) {
        messageService.clearConversationMessages(conversationId);
        log.info("Cleared all messages for conversation {}", conversationId);
        return ResponseEntity.noContent().build();
    }
}