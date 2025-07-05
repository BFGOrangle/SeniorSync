package orangle.seniorsync.chatbot.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.dto.ReplyOption;
import orangle.seniorsync.chatbot.dto.ReplyDto;
import orangle.seniorsync.chatbot.fsm.ConversationStateMachinePersister;
import orangle.seniorsync.chatbot.fsm.ICampaignStateMachineFactory;
import orangle.seniorsync.chatbot.model.Conversation;
import orangle.seniorsync.chatbot.model.Message;
import orangle.seniorsync.chatbot.repository.ConversationRepository;
import orangle.seniorsync.chatbot.repository.FsmStateReplyOptionsRepository;
import orangle.seniorsync.chatbot.repository.MessageRepository;
import orangle.seniorsync.chatbot.service.replyoption.IReplyOptionStrategyContext;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.StateMachineEventResult;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;

@Slf4j
@Service
public class ReplyService implements IReplyService {

    private final ICampaignStateMachineFactory campaignStateMachineFactory;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationStateMachinePersister conversationStateMachinePersister;
    private final IReplyOptionStrategyContext replyOptionStrategyContext;

    public ReplyService(ICampaignStateMachineFactory campaignStateMachineFactory,
                        ConversationRepository conversationRepository,
                        MessageRepository messageRepository,
                        FsmStateReplyOptionsRepository fsmStateReplyOptionsRepository,
                        ConversationStateMachinePersister conversationStateMachinePersister,
                        IReplyOptionStrategyContext replyOptionStrategyContext) {
        this.campaignStateMachineFactory = campaignStateMachineFactory;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.conversationStateMachinePersister = conversationStateMachinePersister;
        this.replyOptionStrategyContext = replyOptionStrategyContext;
    }

    public ReplyDto replyMessage(String campaignName, Long seniorId, ReplyOption replyOption) {
        String fsmEvent = replyOption.fsmEvent();
        String messageText = replyOption.text();

        // Assuming one senior can only have one open request at a time
        Conversation conversation = loadExistingOrCreateNewConversation(campaignName, seniorId);
        log.info("Conversation loaded or created of id: {}", conversation.getId());

        Message incomingMessage = persistMessage(conversation.getId(), messageText, "IN"); // use enum for direction
        log.info("Incoming message persisted with id: {}", incomingMessage.getId());

        // Restore and start conversation fsm
        StateMachine<String, String> stateMachine = campaignStateMachineFactory.getStateMachine(campaignName, conversation.getId().toString());
        conversationStateMachinePersister.restore(stateMachine, conversation.getId());
        stateMachine.startReactively().block();

        String currentState = stateMachine.getState().getId();

        // Trigger fsm transition with the event
        Flux<StateMachineEventResult<String, String>> stateMachineEventResultFlux = stateMachine.sendEvent(Mono.just(MessageBuilder.withPayload(fsmEvent)
                .setHeader("conversationId", conversation.getId())
                .setHeader("seniorId", seniorId)
                .setHeader("text", messageText)
                .build()));

        StateMachineEventResult<String, String> stateTransitionResult = stateMachineEventResultFlux.blockLast();
        verifyFsmStateEventAccepted(stateTransitionResult);

        // Verify that the state machine transitioned to a new state
        String newState = stateMachine.getState().getId();
        boolean isTransitioned = newState != null && !newState.equals(currentState);
        if (!isTransitioned) {
            log.error("State machine did not transition from '{}' with event '{}'. Current state remains '{}'", currentState, fsmEvent, newState);
            throw new IllegalStateException("State machine did not transition as expected. Current state: " + currentState + ", Event: " + fsmEvent);
        }

        log.info("Fsm transitioned successfully from: {} -> {}", currentState, newState);

        // Check if we've reached COMPLETED state and auto-transition to START
        if ("COMPLETED".equals(newState)) {
            log.info("Reached COMPLETED state, auto-transitioning to START");

            // Auto-trigger transition from COMPLETED to START
            Flux<StateMachineEventResult<String, String>> autoRestartResultFlux = stateMachine.sendEvent(Mono.just(MessageBuilder.withPayload("AUTO_RESTART")
                    .setHeader("conversationId", conversation.getId())
                    .setHeader("seniorId", seniorId)
                    .build()));

            StateMachineEventResult<String, String> autoRestartResult = autoRestartResultFlux.blockLast();
            verifyFsmStateEventAccepted(autoRestartResult);

            // Update newState to reflect the auto-transition
            newState = stateMachine.getState().getId();
            log.info("Auto-transitioned from COMPLETED to: {}", newState);
        }

        // Persist new FSM state after processing the event
        conversationStateMachinePersister.persist(stateMachine, conversation.getId());
        conversation.setCurrentState(newState);
        conversationRepository.save(conversation);

        stateMachine.stopReactively().block();

        // Prepare outbound reply - get reply options for the NEW state
        String replyMessagePrompt = lookupPrompt(newState);

        List<ReplyOption> replyOptions = replyOptionStrategyContext.getReplyOptionContents(campaignName, newState);

        // Persist outbound message
        Message outboundMessage = persistMessage(conversation.getId(), replyMessagePrompt, "OUT");
        Message savedOut = messageRepository.save(outboundMessage);

        return new ReplyDto(
                savedOut.getId(),
                seniorId,
                replyMessagePrompt,
                replyOptions
        );
    }

    @Override
    public List<ReplyOption> getCurrentReplyOptions(String campaignName, Long seniorId) {
        // Load existing conversation
        Conversation conversation = conversationRepository.findByCampaignNameAndSeniorId(campaignName, seniorId);
        if (conversation == null) {
            // No conversation exists, return START state options
            return replyOptionStrategyContext.getReplyOptionContents(campaignName, "START");
        }

        String currentState = conversation.getCurrentState();
        log.info("Getting current reply options for senior {} in state: {}", seniorId, currentState);

        // Get reply options for the current state
        return replyOptionStrategyContext.getReplyOptionContents(campaignName, currentState);
    }

    private Conversation loadExistingOrCreateNewConversation(String campaignName, Long seniorId) {
        Conversation conversation = conversationRepository.findByCampaignNameAndSeniorId(campaignName, seniorId);
        if (conversation == null) {
            conversation = Conversation.builder()
                    .campaignName(campaignName)
                    .seniorId(seniorId)
                    .currentState("START")
                    .extendedState(new HashMap<>())
                    .build();
        }
        return conversationRepository.save(conversation);
    }

    private Message persistMessage(Long conversationId, String messageText, String direction) {
        Message newMessage = Message.builder()
                .conversationId(conversationId)
                .content(messageText)
                .direction(direction)
                .build();
        return messageRepository.save(newMessage);
    }

    private void verifyFsmStateEventAccepted(StateMachineEventResult<String, String> stateMachineEventResult) {
        if (stateMachineEventResult == null) {
            log.error("State machine event result is null");
            throw new IllegalStateException("State machine event result is null");
        }

        StateMachineEventResult.ResultType resultType = stateMachineEventResult.getResultType();
        switch (resultType) {
            case ACCEPTED:
                log.info("Event was accepted and processed successfully");
                break;
            case DENIED:
                log.error("Event was denied by the state machine");
                throw new IllegalStateException("State machine denied the event, see above logs for state machine errors (if any)");
            case DEFERRED:
                log.warn("Event was deferred");
                break;
            default:
                log.error("Unexpected result type: {}", resultType);
                throw new IllegalStateException("Unexpected state machine result: " + resultType);
        }
    }

    /**
     * TODO: This is a temporary method to return prompts based on the state. Should be persisted in a database table.
     */
    private String lookupPrompt(String state) {
        return switch (state) {
            case "START" -> "Hi there, let me help you with your request. Select Okay to start :)";
            case "AWAITING_TYPE" -> "Please choose a request type:";
            case "AWAITING_TITLE" -> "What’s the title of your request?";
            case "AWAITING_DESCRIPTION" -> "Please describe your request:";
            case "AWAITING_PRIORITY" -> "How urgent is this request?";
            case "AWAITING_CONFIRMATION" -> "Looks good—submit now?";
            case "COMPLETED" -> "Thanks! Your request has been lodged.";
            default -> "Sorry, I didn’t understand that.";
        };
    }
}
