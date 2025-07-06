package orangle.seniorsync.chatbot.controller;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.ConversationDto;
import orangle.seniorsync.chatbot.dto.MessageDto;
import orangle.seniorsync.chatbot.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/chatbot/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversation/{conversationId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<MessageDto>> getMessagesByConversation(@PathVariable Long conversationId) {
        List<MessageDto> messages = messageService.getMessagesByConversationId(conversationId);
        log.info("Retrieved {} messages for conversation {}", messages.size(), conversationId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/senior/{seniorId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<MessageDto>> getMessagesBySenior(
            @PathVariable Long seniorId,
            @RequestParam(defaultValue = "lodging_request") String campaignName) {
        List<MessageDto> messages = messageService.getMessagesBySeniorAndCampaign(seniorId, campaignName);
        log.info("Retrieved {} messages for senior {} in campaign {}", messages.size(), seniorId, campaignName);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/senior/{seniorId}/active-conversation")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ConversationDto> getActiveConversation(
            @PathVariable Long seniorId,
            @RequestParam(defaultValue = "lodging_request") String campaignName) {
        Optional<ConversationDto> conversation = messageService.getActiveConversation(seniorId, campaignName);
        return conversation.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/conversation/{conversationId}/clear")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> clearConversationMessages(@PathVariable Long conversationId) {
        messageService.clearConversationMessages(conversationId);
        log.info("Cleared all messages for conversation {}", conversationId);
        return ResponseEntity.noContent().build();
    }
}