package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
