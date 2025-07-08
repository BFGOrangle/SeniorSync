package orangle.seniorsync.chatbot.mapper;

import orangle.seniorsync.chatbot.dto.MessageDto;
import orangle.seniorsync.chatbot.model.Message;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MessageMapper {
    MessageDto toDto(Message message);
}
