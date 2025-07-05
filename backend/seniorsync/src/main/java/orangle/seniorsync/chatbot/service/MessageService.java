package orangle.seniorsync.chatbot.service;

import orangle.seniorsync.chatbot.dto.ConversationDto;
import orangle.seniorsync.chatbot.dto.MessageDto;
import orangle.seniorsync.chatbot.model.Conversation;
import orangle.seniorsync.chatbot.model.Message;
import orangle.seniorsync.chatbot.repository.ConversationRepository;
import orangle.seniorsync.chatbot.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    
    public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
    }
    
    public List<MessageDto> getMessagesByConversationId(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::toDto)
                .toList();
    }
    
    public List<MessageDto> getMessagesBySeniorAndCampaign(Long seniorId, String campaignName) {
        return messageRepository.findBySeniorIdAndCampaignNameOrderByCreatedAtAsc(seniorId, campaignName)
                .stream()
                .map(this::toDto)
                .toList();
    }
    
    public Optional<ConversationDto> getActiveConversation(Long seniorId, String campaignName) {
        Conversation conversation = conversationRepository.findByCampaignNameAndSeniorId(campaignName, seniorId);
        if (conversation != null && !"COMPLETED".equals(conversation.getCurrentState())) {
            return Optional.of(toConversationDto(conversation));
        }
        return Optional.empty();
    }
    
    public void clearConversationMessages(Long conversationId) {
        messageRepository.deleteAll(messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId));
    }
    
    private MessageDto toDto(Message message) {
        return new MessageDto(
                message.getId(),
                message.getConversationId(),
                message.getDirection(),
                message.getContent(),
                message.getEvent(),
                message.getCreatedAt()
        );
    }
    
    private ConversationDto toConversationDto(Conversation conversation) {
        return new ConversationDto(
                conversation.getId(),
                conversation.getSeniorId(),
                conversation.getCampaignName(),
                conversation.getCurrentState(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }
}