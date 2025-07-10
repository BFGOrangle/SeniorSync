package orangle.seniorsync.chatbot.fsm;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.chatbot.fsm.common.action.FsmErrorHandlingAction;
import orangle.seniorsync.chatbot.model.FsmTransition;
import orangle.seniorsync.chatbot.repository.FsmTransitionRepository;
import org.springframework.context.ApplicationContext;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.action.Action;
import org.springframework.statemachine.config.StateMachineBuilder;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.guard.Guard;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class CampaignStateMachineFactory implements ICampaignStateMachineFactory {
    private final Map<String, StateMachineFactory<String,String>> factoryCache = new ConcurrentHashMap<>();
    private final FsmTransitionRepository transitionRepo;
    private final ApplicationContext ctx;

    public CampaignStateMachineFactory(
            FsmTransitionRepository transitionRepo,
            ApplicationContext ctx) {
        this.transitionRepo = transitionRepo;
        this.ctx = ctx;
        initFactories();
    }

    private void initFactories() {
        List<String> allCampaignNames = transitionRepo.findAllCampaignNames();
        allCampaignNames.forEach(campaignName -> {
            try {
                factoryCache.put(campaignName, buildFactoryForCampaign(campaignName));
            } catch (Exception e) {
                throw new RuntimeException("Failed to create state machine factory for campaign: " + campaignName, e);
            }
        });
    }

    private StateMachineFactory<String, String> buildFactoryForCampaign(String campaignName) throws Exception {
        Set<String> allStates = new HashSet<>();
        allStates.addAll(transitionRepo.findAllSourceStateNamesByCampaignName(campaignName));
        allStates.addAll(transitionRepo.findAllDestStateNamesByCampaignName(campaignName));
        List<FsmTransition> transitions = transitionRepo.findAllByCampaignName(campaignName);

        log.info("Building state machine for campaign: {}", campaignName);
        log.info("All states: {}", allStates);
        log.info("Total Transitions: {}", transitions.size());
        for (FsmTransition transition : transitions) {
            log.info("Transition: {} --[{}]--> {}",
                    transition.getSourceState(),
                    transition.getTrigger(),
                    transition.getDestState());
        }

        StateMachineBuilder.Builder<String, String> stateMachineBuilder = StateMachineBuilder.builder();
        stateMachineBuilder.configureStates()
                .withStates()
                .initial("INIT") // Where "INIT" is the initial state
                .states(allStates);

        var transitionConfigurer = stateMachineBuilder.configureTransitions();

        boolean hasTransitions = false;
        for (FsmTransition transition : transitions) {
            if (transition.getCampaignName().equals(campaignName)) {
                hasTransitions = true;
                transitionConfigurer.withExternal()
                        .source(transition.getSourceState())
                        .target(transition.getDestState())
                        .event(transition.getTrigger())
                        .guard(lookupGuard(transition.getGuardName()))
                        .action(lookupAction(transition.getActionName()), new FsmErrorHandlingAction());
            }
        }

        if (!hasTransitions) {
            throw new IllegalStateException("No transitions found for campaign: " + campaignName);
        }

        return stateMachineBuilder.createFactory();
    }

    /**
     * Create a fresh, isolated StateMachine instance for a given campaign and a unique conversationId
     */
    public StateMachine<String,String> getStateMachine(String campaignName, String conversationId) {
        StateMachineFactory<String,String> factory = factoryCache.get(campaignName);
        if (factory == null) {
            throw new IllegalArgumentException("Unknown campaign: " + campaignName);
        }
        return factory.getStateMachine(conversationId);
    }

    // Most versions of the Spring-StateMachine DSL will discard a transition whose guard or action is null (or blow up), effectively giving you zero outgoing edges.
    // Hence, in our lookup methods we should return a no-op guard instead of null:
    private Guard<String, String> lookupGuard(String name) {
        if (!StringUtils.hasText(name) || !ctx.containsBean(name)) {
            // No-op guard that always returns true
            return (context) -> true;
        }
        return ctx.getBean(name, Guard.class);
    }

    private Action<String,String> lookupAction(String name) {
        if (!StringUtils.hasText(name) || !ctx.containsBean(name)) {
            // No-op action that does nothing
            return (context) -> {};
        }
        return ctx.getBean(name, Action.class);
    }
}
