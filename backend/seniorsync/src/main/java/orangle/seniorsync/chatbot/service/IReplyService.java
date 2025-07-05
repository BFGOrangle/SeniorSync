package orangle.seniorsync.chatbot.service;

import orangle.seniorsync.chatbot.dto.ReplyOption;
import orangle.seniorsync.chatbot.dto.ReplyDto;

public interface IReplyService {
    ReplyDto replyMessage(String campaignName, Long seniorId, ReplyOption replyOption);
}
