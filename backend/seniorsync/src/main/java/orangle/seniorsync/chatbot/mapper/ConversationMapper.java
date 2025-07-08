package orangle.seniorsync.chatbot.mapper;

import orangle.seniorsync.chatbot.dto.ConversationDto;
import orangle.seniorsync.chatbot.model.Conversation;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ConversationMapper {
    ConversationDto toDto(Conversation conversation);
}
