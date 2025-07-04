package orangle.seniorsync.chatbot.fsm;

import org.springframework.statemachine.StateMachine;

public interface ICampaignStateMachineFactory {
    StateMachine<String,String> getStateMachine(String campaignName, String processId);
}
