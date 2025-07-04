package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
}
