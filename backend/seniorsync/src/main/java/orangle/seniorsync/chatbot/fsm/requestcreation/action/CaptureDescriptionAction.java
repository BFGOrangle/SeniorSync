package orangle.seniorsync.chatbot.fsm.requestcreation.action;

import orangle.seniorsync.chatbot.fsm.requestcreation.util.ContextExtractor;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequestDraft;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestDraftRepository;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component("captureDescriptionAction")
public class CaptureDescriptionAction implements Action<String, String> {

    private final SeniorRequestDraftRepository seniorRequestDraftRepository;

    public CaptureDescriptionAction(SeniorRequestDraftRepository seniorRequestDraftRepository) {
        this.seniorRequestDraftRepository = seniorRequestDraftRepository;
    }

    @Override
    public void execute(StateContext<String, String> context) {
        SeniorRequestDraft draftRequest = ContextExtractor.getSeniorRequestDraft(context, seniorRequestDraftRepository);

        String description = (String) context.getMessageHeader("text");
        if (!StringUtils.hasText(description.trim())) {
            throw new IllegalArgumentException("Description is required");
        }

        draftRequest.setDescription(description);
        seniorRequestDraftRepository.save(draftRequest);
    }
}