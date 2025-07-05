package orangle.seniorsync.chatbot.fsm.requestcreation.action;

import orangle.seniorsync.chatbot.fsm.requestcreation.util.ContextExtractor;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequestDraft;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestDraftRepository;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component("captureTitleAction")
public class CaptureTitleAction implements Action<String, String> {

    private final SeniorRequestDraftRepository seniorRequestDraftRepository;

    public CaptureTitleAction(SeniorRequestDraftRepository seniorRequestDraftRepository) {
        this.seniorRequestDraftRepository = seniorRequestDraftRepository;
    }

    @Override
    public void execute(StateContext<String, String> context) {
        SeniorRequestDraft draftRequest = ContextExtractor.getSeniorRequestDraft(context, seniorRequestDraftRepository);

        String title = (String) context.getMessageHeader("text");
        if (!StringUtils.hasText(title.trim())) {
            throw new IllegalArgumentException("Title is required");
        }

        draftRequest.setTitle(title);
        seniorRequestDraftRepository.save(draftRequest);
    }
}