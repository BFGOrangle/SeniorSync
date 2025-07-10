package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.FsmStatePrompt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FsmStatePromptRepository extends JpaRepository<FsmStatePrompt, Long> {
    Optional<FsmStatePrompt> findByCampaignNameAndStateAndLanguageCode(String campaignName, String state, String languageCode);
}