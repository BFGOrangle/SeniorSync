package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByCampaignNameAndSeniorId(String campaignName, Long seniorId);
}
