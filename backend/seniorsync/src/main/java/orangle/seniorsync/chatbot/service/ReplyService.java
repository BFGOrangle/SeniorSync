package orangle.seniorsync.chatbot.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ReplyService implements IReplyService {

    public ReplyService() {
    }

    public void replyMessage() {
        log.info("replying in service class");
    }
}
