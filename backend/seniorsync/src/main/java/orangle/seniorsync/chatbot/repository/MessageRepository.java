package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    @Query("SELECT m FROM Message m WHERE m.conversationId IN " +
            "(SELECT c.id FROM Conversation c WHERE c.seniorId = ?1 AND c.campaignName = ?2) " +
            "ORDER BY m.createdAt ASC")
    List<Message> findBySeniorIdAndCampaignNameOrderByCreatedAtAsc(Long seniorId, String campaignName);
}
