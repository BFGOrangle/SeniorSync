package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.FsmStateReplyOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FsmStateReplyOptionsRepository extends JpaRepository<FsmStateReplyOption, Long> {
    List<FsmStateReplyOption> findByCampaignNameAndStateAndLanguageCode(String campaignName, String state, String languageCode);
}
