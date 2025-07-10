package orangle.seniorsync.chatbot.service.replyoption;

import orangle.seniorsync.chatbot.dto.ReplyOption;

import java.util.List;

public interface IReplyOptionStrategy {

    /**
     * Determines if this strategy is applicable for the given campaign and state.
     */
    boolean isApplicable(String campaignName, String state);

    /**
     * Retrieves the reply option contents based on this strategy.
     */
    List<ReplyOption> getReplyOptions(String campaignName, String state, String languageCode);
}