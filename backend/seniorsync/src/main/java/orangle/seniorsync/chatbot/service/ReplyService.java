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
import orangle.seniorsync.chatbot.service.replyprompt.IReplyPromptService;
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
    private final IReplyPromptService replyPromptService;

    public ReplyService(ICampaignStateMachineFactory campaignStateMachineFactory,
                        ConversationRepository conversationRepository,
                        MessageRepository messageRepository,
                        FsmStateReplyOptionsRepository fsmStateReplyOptionsRepository,
                        ConversationStateMachinePersister conversationStateMachinePersister,
                        IReplyOptionStrategyContext replyOptionStrategyContext,
                        IReplyPromptService replyPromptService) {
        this.campaignStateMachineFactory = campaignStateMachineFactory;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.conversationStateMachinePersister = conversationStateMachinePersister;
        this.replyOptionStrategyContext = replyOptionStrategyContext;
        this.replyPromptService = replyPromptService;
    }

    public ReplyDto replyMessage(String campaignName, Long seniorId, ReplyOption replyOption, String languageCode) {
        String fsmEvent = replyOption.fsmEvent();
        String replyDisplayText = replyOption.displayText();
        String replyValue = replyOption.value();

        // Assuming one senior can only have one open request at a time
        Conversation conversation = loadExistingOrCreateNewConversation(campaignName, seniorId);
        log.info("Conversation loaded or created of id: {}", conversation.getId());

        Message incomingMessage = persistMessage(conversation.getId(), replyDisplayText, "IN"); // use enum for direction
        log.info("Incoming message persisted with id: {}", incomingMessage.getId());

        // Restore and start conversation fsm
        StateMachine<String, String> stateMachine = campaignStateMachineFactory.getStateMachine(campaignName, conversation.getId().toString());
        conversationStateMachinePersister.restore(stateMachine, conversation.getId());
        stateMachine.startReactively().block();

        String currentState = stateMachine.getState().getId();

        // Trigger fsm transition with the event
        StateMachineEventResult<String, String> stateTransitionResult = stateMachine.sendEvent(Mono.just(MessageBuilder.withPayload(fsmEvent)
                .setHeader("conversationId", conversation.getId())
                .setHeader("seniorId", seniorId)
                .setHeader("text", replyValue)
                .build())).blockLast();

        verifyFsmStateEventAccepted(stateTransitionResult);

        // Verify that the state machine transitioned to a new state
        String newState = stateMachine.getState().getId();
        boolean isTransitioned = newState != null && !newState.equals(currentState);
        if (!isTransitioned) {
            log.error("State machine did not transition from '{}' with event '{}'. Current state remains '{}'", currentState, fsmEvent, newState);
            throw new IllegalStateException("State machine did not transition as expected. Current state: " + currentState + ", Event: " + fsmEvent);
        }

        log.info("Fsm transitioned successfully from: {} -> {}", currentState, newState);

        // Persist new FSM state after processing the event
        conversationStateMachinePersister.persist(stateMachine, conversation.getId());
        conversation.setCurrentState(newState);

        stateMachine.stopReactively().block();

        // Prepare outbound reply - get reply prompt and options for the NEW state
        String replyMessagePrompt = replyPromptService.getReplyPrompt(campaignName, newState, languageCode);
        List<ReplyOption> replyOptions = replyOptionStrategyContext.getReplyOptionContents(campaignName, newState, languageCode);

        // Persist outbound message
        Message savedOut = persistMessage(conversation.getId(), replyMessagePrompt, "OUT");

        return new ReplyDto(
                savedOut.getId(),
                seniorId,
                replyMessagePrompt,
                replyOptions
        );
    }

    @Override
    public ReplyDto getCurrentReplyResponse(String campaignName, Long seniorId, String languageCode) {
        // Load existing conversation
        return conversationRepository.findByCampaignNameAndSeniorId(campaignName, seniorId)
                .map(conv -> {
                    String currentState = conv.getCurrentState();
                    String replyMessagePrompt = replyPromptService.getReplyPrompt(campaignName, currentState, languageCode);
                    return new ReplyDto(
                            null, // Since we are only fetching prompt an options for an alr sent out chatbot reply
                            seniorId,
                            replyMessagePrompt,
                            replyOptionStrategyContext.getReplyOptionContents(campaignName, currentState, languageCode)
                    );
                })
                .orElseGet(() -> {
                    // No conversation exists, return INIT state options
                    String replyMessagePrompt = replyPromptService.getReplyPrompt(campaignName, "INIT", languageCode);
                    return new ReplyDto(
                            null, // Since we are only fetching prompt an options for an alr sent out chatbot reply
                            seniorId,
                            replyMessagePrompt,
                            replyOptionStrategyContext.getReplyOptionContents(campaignName, "INIT", languageCode)
                    );
                });
    }

    private Conversation loadExistingOrCreateNewConversation(String campaignName, Long seniorId) {
        Conversation conversation = conversationRepository.findByCampaignNameAndSeniorId(campaignName, seniorId)
                .orElseGet(() -> Conversation.builder()
                        .campaignName(campaignName)
                        .seniorId(seniorId)
                        .currentState("INIT")
                        .extendedState(new HashMap<>())
                        .build());
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
}
