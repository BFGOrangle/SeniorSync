package orangle.seniorsync.chatbot.fsm.requestcreation.action;

import orangle.seniorsync.chatbot.fsm.requestcreation.util.ContextExtractor;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequestDraft;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestDraftRepository;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;
import org.springframework.stereotype.Component;

@Component("capturePriorityAction")
public class CapturePriorityAction implements Action<String, String> {

    private final SeniorRequestDraftRepository seniorRequestDraftRepository;

    public CapturePriorityAction(SeniorRequestDraftRepository seniorRequestDraftRepository) {
        this.seniorRequestDraftRepository = seniorRequestDraftRepository;
    }

    @Override
    public void execute(StateContext<String, String> context) {
        SeniorRequestDraft draftRequest = ContextExtractor.getSeniorRequestDraft(context, seniorRequestDraftRepository);

        String event = context.getEvent();
        Short priority = mapEventToPriority(event);

        draftRequest.setPriority(priority);
        seniorRequestDraftRepository.save(draftRequest);
    }

    private Short mapEventToPriority(String event) {
        return switch (event) {
            case "PRIORITY_LOW" -> (short) 1;
            case "PRIORITY_MEDIUM" -> (short) 2;
            case "PRIORITY_HIGH" -> (short) 3;
            default -> throw new IllegalArgumentException("Unknown priority event: " + event);
        };
    }
}
