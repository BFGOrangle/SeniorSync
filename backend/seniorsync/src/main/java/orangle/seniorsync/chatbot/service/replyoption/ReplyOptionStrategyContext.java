package orangle.seniorsync.chatbot.service.replyoption;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.ReplyOption;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class ReplyOptionStrategyContext implements IReplyOptionStrategyContext {

    private final List<IReplyOptionStrategy> strategies;

    public ReplyOptionStrategyContext(List<IReplyOptionStrategy> strategies) {
        this.strategies = strategies; // The list is already sorted by Spring based on @Order/Ordered
    }

    private IReplyOptionStrategy getApplicableStrategy(String campaignName, String state) {
        // Iterate through the already-sorted list of strategies by priority.
        // The first one applicable strategy will be returned.
        for (IReplyOptionStrategy strategy : strategies) {
            if (strategy.isApplicable(campaignName, state)) {
                return strategy;
            }
        }
        throw new IllegalStateException("No applicable reply option strategy found for campaign: " + campaignName + " and state: " + state);
    }

    public List<ReplyOption> getReplyOptionContents(String campaignName, String state, String languageCode) {
        IReplyOptionStrategy strategy = getApplicableStrategy(campaignName, state);
        log.info("Using reply option strategy: {} for campaign: {}, state: {}", strategy.getClass().getName(), campaignName, state);
        return strategy.getReplyOptions(campaignName, state, languageCode);
    }
}