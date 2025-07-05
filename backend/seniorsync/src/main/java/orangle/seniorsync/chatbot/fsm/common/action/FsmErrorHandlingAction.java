package orangle.seniorsync.chatbot.fsm.common.action;

import lombok.extern.slf4j.Slf4j;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;

@Slf4j
public class FsmErrorHandlingAction implements Action<String, String> {

    @Override
    public void execute(StateContext<String, String> context) {
        // Log the error details
        Exception exception = context.getException();
        log.error("Error occurred in state machine: {}", exception.getMessage(), exception);
    }
}
