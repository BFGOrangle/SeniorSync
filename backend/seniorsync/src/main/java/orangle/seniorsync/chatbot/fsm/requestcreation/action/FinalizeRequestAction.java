package orangle.seniorsync.chatbot.fsm.requestcreation.action;

import orangle.seniorsync.chatbot.fsm.requestcreation.util.ContextExtractor;
import orangle.seniorsync.crm.requestmanagement.dto.CreateSeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequestDraft;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestDraftRepository;
import orangle.seniorsync.crm.requestmanagement.service.IRequestManagementService;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;
import org.springframework.stereotype.Component;

@Component("finalizeRequestAction")
public class FinalizeRequestAction implements Action<String, String> {

    private final SeniorRequestDraftRepository seniorRequestDraftRepository;
    private final IRequestManagementService requestManagementService;

    public FinalizeRequestAction(SeniorRequestDraftRepository seniorRequestDraftRepository,
                                 IRequestManagementService requestManagementService) {
        this.seniorRequestDraftRepository = seniorRequestDraftRepository;
        this.requestManagementService = requestManagementService;
    }

    @Override
    public void execute(StateContext<String, String> context) {
        SeniorRequestDraft draftRequest = ContextExtractor.getSeniorRequestDraft(context, seniorRequestDraftRepository);

        // Validate that all required fields are filled
        if (draftRequest.getRequestTypeId() == null) {
            throw new IllegalArgumentException("Request type is required");
        }
        if (draftRequest.getTitle() == null || draftRequest.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (draftRequest.getDescription() == null || draftRequest.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (draftRequest.getPriority() == null) {
            throw new IllegalArgumentException("Priority is required");
        }

        // Create the final request using the existing service
        CreateSeniorRequestDto createDto = new CreateSeniorRequestDto(
                draftRequest.getSeniorId(),
                draftRequest.getRequestTypeId(),
                draftRequest.getTitle(),
                draftRequest.getDescription(),
                draftRequest.getPriority(),
                null
        );

        var finalRequest = requestManagementService.createRequest(createDto);

        // Store the final request ID in context for potential future use
        context.getExtendedState()
                .getVariables()
                .put("finalRequestId", finalRequest.id());

        // Clean up the draftRequest after successful creation
        seniorRequestDraftRepository.delete(draftRequest);
    }
}
