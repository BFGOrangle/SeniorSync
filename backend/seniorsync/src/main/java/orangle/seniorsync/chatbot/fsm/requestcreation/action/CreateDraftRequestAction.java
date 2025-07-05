package orangle.seniorsync.chatbot.fsm.requestcreation.action;

import orangle.seniorsync.crm.requestmanagement.model.SeniorRequestDraft;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestDraftRepository;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;
import org.springframework.stereotype.Component;

@Component("createDraftRequestAction")
public class CreateDraftRequestAction implements Action<String, String> {

    private final SeniorRequestDraftRepository seniorRequestDraftRepository;

    public CreateDraftRequestAction(SeniorRequestDraftRepository seniorRequestDraftRepository) {
        this.seniorRequestDraftRepository = seniorRequestDraftRepository;
    }

    @Override
    public void execute(StateContext<String, String> context) {
        Long seniorId = (Long) context.getMessageHeader("seniorId");
        if (seniorId == null) {
            throw new IllegalArgumentException("Senior ID is required");
        }

        SeniorRequestDraft draft = new SeniorRequestDraft();
        draft.setSeniorId(seniorId);
        draft = seniorRequestDraftRepository.save(draft);

        // Store draft ID for subsequent steps
        context.getExtendedState()
                .getVariables()
                .put("draftId", draft.getId());
    }
}
