package orangle.seniorsync.chatbot.service;

import orangle.seniorsync.chatbot.dto.ConversationDto;
import orangle.seniorsync.chatbot.dto.MessageDto;
import orangle.seniorsync.chatbot.mapper.ConversationMapper;
import orangle.seniorsync.chatbot.mapper.MessageMapper;
import orangle.seniorsync.chatbot.model.Conversation;
import orangle.seniorsync.chatbot.repository.ConversationRepository;
import orangle.seniorsync.chatbot.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;
    private final MessageMapper messageMapper;
    
    public MessageService(
            MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            ConversationMapper conversationMapper,
            MessageMapper messageMapper) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.conversationMapper = conversationMapper;
        this.messageMapper = messageMapper;
    }
    
    public List<MessageDto> getMessagesByConversationId(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(messageMapper::toDto)
                .toList();
    }
    
    public List<MessageDto> getMessagesBySeniorAndCampaign(Long seniorId, String campaignName) {
        return messageRepository.findBySeniorIdAndCampaignNameOrderByCreatedAtAsc(seniorId, campaignName)
                .stream()
                .map(messageMapper::toDto)
                .toList();
    }
    
    public Optional<ConversationDto> getActiveConversation(Long seniorId, String campaignName) {
        return conversationRepository.findByCampaignNameAndSeniorId(campaignName, seniorId)
                .filter(conv -> !"COMPLETED".equals(conv.getCurrentState()))
                .map(conversationMapper::toDto);
    }
    
    public void clearConversationMessages(Long conversationId) {
        messageRepository.deleteAll(messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId));
    }
}