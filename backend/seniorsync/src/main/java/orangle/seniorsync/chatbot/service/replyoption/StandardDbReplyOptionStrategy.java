package orangle.seniorsync.chatbot.service.replyoption;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.ReplyOption;
import orangle.seniorsync.chatbot.model.FsmStateReplyOption;
import orangle.seniorsync.chatbot.repository.FsmStateReplyOptionsRepository;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@Order // This is the default strategy, it by default have the lowest precedence if not specified.
public class StandardDbReplyOptionStrategy implements IReplyOptionStrategy {

    private final FsmStateReplyOptionsRepository fsmStateReplyOptionsRepository;

    public StandardDbReplyOptionStrategy(FsmStateReplyOptionsRepository fsmStateReplyOptionsRepository) {
        this.fsmStateReplyOptionsRepository = fsmStateReplyOptionsRepository;
    }

    @Override
    public boolean isApplicable(String campaignName, String state) {
        // This strategy is the default, so it supports all campaigns/states
        // Of course, a strategy of higher priority can override this strategy for specific campaigns/states
        return true;
    }

    @Override
    public List<ReplyOption> getReplyOptions(String campaignName, String state) {
        List<FsmStateReplyOption> fsmStateReplyOptions = fsmStateReplyOptionsRepository.findByCampaignNameAndState(campaignName, state);
        if (fsmStateReplyOptions.isEmpty()) {
            log.warn("No standard reply options found for campaign: " + campaignName + " and state: " + state);
        }
        return fsmStateReplyOptions.stream()
                .map(fsmStateReplyOption -> new ReplyOption(
                        fsmStateReplyOption.getContent(),
                        fsmStateReplyOption.getEvent()
                ))
                .toList();
    }
}
