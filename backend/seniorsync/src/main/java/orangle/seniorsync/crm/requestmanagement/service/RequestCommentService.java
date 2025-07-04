package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.crm.requestmanagement.repository.RequestCommentRepository;
import org.springframework.stereotype.Service;

@Service
public class RequestCommentService implements IRequestCommentService {

    private final RequestCommentRepository requestCommentRepository;

    public RequestCommentService(RequestCommentRepository requestCommentRepository) {
        this.requestCommentRepository = requestCommentRepository;
    }
}
