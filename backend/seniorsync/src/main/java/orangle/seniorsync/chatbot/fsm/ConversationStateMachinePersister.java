package orangle.seniorsync.chatbot.fsm;

import org.springframework.statemachine.ExtendedState;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.persist.StateMachinePersister;
import org.springframework.statemachine.support.DefaultExtendedState;
import org.springframework.stereotype.Component;
import orangle.seniorsync.chatbot.model.Conversation;
import orangle.seniorsync.chatbot.repository.ConversationRepository;
import org.springframework.statemachine.StateMachineContext;
import org.springframework.statemachine.support.DefaultStateMachineContext;

@Component
public class ConversationStateMachinePersister implements StateMachinePersister<String, String, Long> {

    private final ConversationRepository conversationRepository;

    public ConversationStateMachinePersister(ConversationRepository repo) {
        this.conversationRepository = repo;
    }

    @Override
    public void persist(StateMachine<String, String> stateMachine, Long convId) {
        Conversation conversation = conversationRepository.findById(convId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found for id: " + convId));
        conversation.setCurrentState(stateMachine.getState().getId());
        conversation.setExtendedState(stateMachine.getExtendedState().getVariables());
        conversationRepository.save(conversation);
    }

    @Override
    public StateMachine<String, String> restore(StateMachine<String, String> stateMachine, Long convId) {
        Conversation conversation = conversationRepository.findById(convId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found for id: " + convId));

        ExtendedState newExtendedState = new DefaultExtendedState();
        newExtendedState.getVariables().putAll(conversation.getExtendedState());

        StateMachineContext<String, String> context = new DefaultStateMachineContext<>(
                conversation.getCurrentState(),
                null,
                null,
                newExtendedState);

        stateMachine.getStateMachineAccessor()
                .doWithAllRegions(a -> a.resetStateMachineReactively(context).block()); // block for synchronous operation as resetStateMachineReactively returns a Mono which is asynchronous

        return stateMachine;
    }
}