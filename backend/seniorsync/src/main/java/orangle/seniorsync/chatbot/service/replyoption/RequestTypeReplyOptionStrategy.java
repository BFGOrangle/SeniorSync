package orangle.seniorsync.chatbot.service.replyoption;

import orangle.seniorsync.chatbot.dto.ReplyOption;
import orangle.seniorsync.crm.requestmanagement.model.RequestType;
import orangle.seniorsync.crm.requestmanagement.repository.RequestTypeRepository;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1)
public class RequestTypeReplyOptionStrategy implements IReplyOptionStrategy {

    private final RequestTypeRepository requestTypeRepository;

    public RequestTypeReplyOptionStrategy(RequestTypeRepository requestTypeRepository) {
        this.requestTypeRepository = requestTypeRepository;
    }

    @Override
    public boolean isApplicable(String campaignName, String state) {
        return "lodging_request".equals(campaignName) && state.equals("AWAITING_TYPE");
    }

    @Override
    public List<ReplyOption> getReplyOptions(String campaignName, String state) {
        List<RequestType> requestTypes = requestTypeRepository.findAll();
        return requestTypes.stream()
                .map(requestType -> new ReplyOption(
                        requestType.getName(),
                        "TYPE_SUBMITTED")
                )
                .toList();
    }
}
