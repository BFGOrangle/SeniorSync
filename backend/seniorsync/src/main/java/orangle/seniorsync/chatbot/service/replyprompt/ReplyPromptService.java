package orangle.seniorsync.chatbot.service.replyprompt;

import orangle.seniorsync.chatbot.repository.FsmStatePromptRepository;
import org.springframework.stereotype.Service;

@Service
public class ReplyPromptService implements IReplyPromptService {

    private final FsmStatePromptRepository fsmStatePromptRepository;

    public ReplyPromptService(FsmStatePromptRepository fsmStatePromptRepository) {
        this.fsmStatePromptRepository = fsmStatePromptRepository;
    }

    @Override
    public String getReplyPrompt(String campaignName, String state, String languageCode) {
        return fsmStatePromptRepository
                .findByCampaignNameAndStateAndLanguageCode(campaignName, state, languageCode)
                .orElseThrow(() -> new IllegalArgumentException("Prompt not found for campaign: " + campaignName + ", state: " + state + ", language: " + languageCode))
                .getPrompt();
    }
}
