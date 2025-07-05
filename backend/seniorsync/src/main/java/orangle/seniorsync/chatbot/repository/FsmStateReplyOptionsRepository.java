package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.FsmStateReplyOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FsmStateReplyOptionsRepository extends JpaRepository<FsmStateReplyOption, Long> {
    List<FsmStateReplyOption> findByCampaignNameAndState(String campaignName, String state);
}
