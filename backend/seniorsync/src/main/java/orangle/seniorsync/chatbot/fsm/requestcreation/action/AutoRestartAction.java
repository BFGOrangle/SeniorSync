package orangle.seniorsync.chatbot.fsm.requestcreation.action;

import orangle.seniorsync.chatbot.model.Conversation;
import orangle.seniorsync.chatbot.repository.ConversationRepository;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("autoRestartAction")
public class AutoRestartAction implements Action<String, String> {

    private final ConversationRepository conversationRepository;

    public AutoRestartAction(ConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    @Override
    public void execute(StateContext<String, String> context) {
        context.getExtendedState().getVariables().clear();
        
        Long conversationId = (Long) context.getMessageHeader("conversationId");
        if (conversationId != null) {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found for id: " + conversationId));
            
            // Reset extended state to empty map with correct type
            Map<Object, Object> emptyState = new HashMap<>();
            conversation.setExtendedState(emptyState);
            conversationRepository.save(conversation);
        }
    }
}