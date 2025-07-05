package orangle.seniorsync.chatbot.fsm.requestcreation.util;

import orangle.seniorsync.crm.requestmanagement.model.SeniorRequestDraft;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestDraftRepository;
import org.springframework.statemachine.StateContext;

public class ContextExtractor {

    public static Long getLongIdFromContext(StateContext<String, String> context, String key, String idName) {
        Object idObj = context.getExtendedState().getVariables().get(key);

        if (idObj == null) {
            throw new IllegalArgumentException(idName + " not found in context");
        }

        Long id;
        try {
            if (idObj instanceof Number) {
                id = ((Number) idObj).longValue();
            } else {
                id = Long.parseLong(idObj.toString());
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid " + idName + " format: " + idObj.toString(), e);
        }
        return id;
    }

    public static SeniorRequestDraft getSeniorRequestDraft(
            StateContext<String, String> context,
            SeniorRequestDraftRepository repository) {
        Long draftRequestId = getLongIdFromContext(context, "draftId", "DraftRequest ID");
        return repository.findById(draftRequestId)
                .orElseThrow(() -> new IllegalArgumentException("DraftRequest not found with ID: " + draftRequestId));
    }
}