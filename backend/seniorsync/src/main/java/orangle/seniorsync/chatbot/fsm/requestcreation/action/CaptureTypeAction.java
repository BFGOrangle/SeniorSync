package orangle.seniorsync.chatbot.fsm.requestcreation.action;

import orangle.seniorsync.chatbot.fsm.requestcreation.util.ContextExtractor;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequestDraft;
import orangle.seniorsync.crm.requestmanagement.repository.RequestTypeRepository;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestDraftRepository;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("captureTypeAction")
public class CaptureTypeAction implements Action<String, String> {

    private final SeniorRequestDraftRepository seniorRequestDraftRepository;
    private final RequestTypeRepository requestTypeRepository;
    private final Map<String, Long> requestTypeMap = new HashMap<>();

    public CaptureTypeAction(SeniorRequestDraftRepository seniorRequestDraftRepository,
                             RequestTypeRepository requestTypeRepository) {
        this.seniorRequestDraftRepository = seniorRequestDraftRepository;
        this.requestTypeRepository = requestTypeRepository;
        initRequestTypeMap();
    }

    @Override
    public void execute(StateContext<String, String> context) {
        SeniorRequestDraft draftRequest = ContextExtractor.getSeniorRequestDraft(context, seniorRequestDraftRepository);

        // Get the actual user message content from the message headers
        String requestTypeDescription = context.getMessageHeaders().get("text", String.class);
        if (requestTypeDescription == null) {
            throw new IllegalArgumentException("User reply content is required but not found in message headers");
        }

        Long requestTypeId = requestTypeMap.get(requestTypeDescription);
        if (requestTypeId == null) {
            throw new IllegalArgumentException("Invalid request type: " + requestTypeDescription);
        }

        draftRequest.setRequestTypeId(requestTypeId);
        seniorRequestDraftRepository.save(draftRequest);
    }

    private void initRequestTypeMap() {
        requestTypeRepository.findAll().forEach(requestType ->
            requestTypeMap.put(requestType.getName(), requestType.getId())
        );
    }
}
