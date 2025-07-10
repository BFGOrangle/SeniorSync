package orangle.seniorsync.chatbot.service.replyoption;

import orangle.seniorsync.chatbot.dto.ReplyOption;

import java.util.List;

public interface IReplyOptionStrategyContext {
    List<ReplyOption> getReplyOptionContents(String campaignName, String state, String languageCode);
}
