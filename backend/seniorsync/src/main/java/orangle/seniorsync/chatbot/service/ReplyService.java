package orangle.seniorsync.chatbot.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.ReplyDto;
import orangle.seniorsync.chatbot.fsm.ICampaignStateMachineFactory;
import org.springframework.statemachine.StateMachine;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class ReplyService implements IReplyService {

    private final ICampaignStateMachineFactory campaignStateMachineFactory;

    public ReplyService(ICampaignStateMachineFactory campaignStateMachineFactory) {
        this.campaignStateMachineFactory = campaignStateMachineFactory;
    }

    public ReplyDto replyMessage(String campaignName, Long seniorId) {
        // Assuming one senior can only have one open request at a time
        StateMachine<String, String> stateMachine = campaignStateMachineFactory.getStateMachine(campaignName, seniorId.toString());
        log.info("replying in service class");
        return new ReplyDto(
                1L,
                1L,
                "This is a reply message",
                List.of("Option 1", "Option 2", "Option 3")
        );
    }
}
