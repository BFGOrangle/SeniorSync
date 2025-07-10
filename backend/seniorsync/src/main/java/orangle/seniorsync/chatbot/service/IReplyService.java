package orangle.seniorsync.chatbot.service;

import orangle.seniorsync.chatbot.dto.ReplyOption;
import orangle.seniorsync.chatbot.dto.ReplyDto;

import java.util.List;

public interface IReplyService {
    ReplyDto replyMessage(String campaignName, Long seniorId, ReplyOption replyOption, String languageCode);
    ReplyDto getCurrentReplyResponse(String campaignName, Long seniorId, String languageCode);
}
