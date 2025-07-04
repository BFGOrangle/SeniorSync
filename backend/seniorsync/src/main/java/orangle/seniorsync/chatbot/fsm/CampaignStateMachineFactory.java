package orangle.seniorsync.chatbot.fsm;

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

        StateMachineBuilder.Builder<String, String> stateMachineBuilder = StateMachineBuilder.builder();
        stateMachineBuilder.configureStates()
                .withStates()
                .initial("START") // Assuming "START" is the initial state
                .states(allStates);
        var transitionConfigurer = stateMachineBuilder.configureTransitions().withExternal();
        for (FsmTransition transition : transitions) {
            if (transition.getCampaignName().equals(campaignName)) {
                transitionConfigurer
                        .source(transition.getSourceState())
                        .target(transition.getDestState())
                        .event(transition.getTrigger())
//                        .guard(lookupGuard(transition.getGuardName()))
//                        .action(lookupAction(transition.getActionName()))
                        .and().withExternal();
            }
        }
        return stateMachineBuilder.createFactory();
    }

    /**
     * Spawn a fresh, isolated StateMachine instance for a given campaign and
     * a unique processId (so you can persist and restore its state independently).
     * Say for senior request lodging, processId is seniorId.
     */
    public StateMachine<String,String> getStateMachine(String campaignName, String processId) {
        StateMachineFactory<String,String> factory = factoryCache.get(campaignName);
        if (factory == null) {
            throw new IllegalArgumentException("Unknown campaign: " + campaignName);
        }
        return factory.getStateMachine(processId);
    }

//    private Guard<String, String> lookupGuard(String name) {
//        return StringUtils.hasText(name)
//                ? ctx.getBean(name, Guard.class)
//                : context -> true;
//    }
//
//    private Action<String,String> lookupAction(String name) {
//        if (!StringUtils.hasText(name)) {
//            return context -> { /* no-op */ };
//        }
//        return ctx.getBean(name, Action.class);
//    }
}
