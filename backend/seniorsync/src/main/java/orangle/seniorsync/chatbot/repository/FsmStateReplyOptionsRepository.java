package orangle.seniorsync.chatbot.repository;

import orangle.seniorsync.chatbot.model.FsmStateReplyOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FsmStateReplyOptionsRepository extends JpaRepository<FsmStateReplyOption, Long> {
}
