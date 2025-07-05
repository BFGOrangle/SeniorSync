package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.crm.requestmanagement.dto.CreateCommentDto;
import orangle.seniorsync.crm.requestmanagement.dto.RequestCommentDto;
import orangle.seniorsync.crm.requestmanagement.mapper.CreateCommentMapper;
import orangle.seniorsync.crm.requestmanagement.mapper.RequestCommentMapper;
import orangle.seniorsync.crm.requestmanagement.model.RequestComment;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.RequestCommentRepository;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RequestCommentService implements IRequestCommentService {

    private final RequestCommentRepository requestCommentRepository;
    private final SeniorRequestRepository seniorRequestRepository;
    private final CreateCommentMapper createCommentMapper;
    private final RequestCommentMapper requestCommentMapper;

    public RequestCommentService(RequestCommentRepository requestCommentRepository, SeniorRequestRepository seniorRequestRepository, CreateCommentMapper createCommentMapper, RequestCommentMapper requestCommentMapper) {
        this.createCommentMapper = createCommentMapper;
        this.requestCommentMapper = requestCommentMapper;
        this.requestCommentRepository = requestCommentRepository;
        this.seniorRequestRepository = seniorRequestRepository;
    }

    /**
     * Creates a new request comment based on the provided DTO.
     * Maps the DTO to an entity, saves it to the repository, and returns the created request as a DTO.
     *
     * @param createCommentDto the DTO containing the details of the request comment to be created
     * @return the created RequestCommentDto
     */
    public RequestCommentDto createComment(CreateCommentDto createCommentDto) {
        RequestComment requestComment = createCommentMapper.toEntity(createCommentDto);

        SeniorRequest seniorRequest = seniorRequestRepository.findById(createCommentDto.requestId())
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + createCommentDto.requestId()));
        requestComment.setRequest(seniorRequest);
        requestComment.setCreatedAt(OffsetDateTime.now());
        RequestComment savedComment = requestCommentRepository.save(requestComment);
        return requestCommentMapper.toDto(savedComment);
    }
/**
     * Retrieves all comments associated with a specific request ID.
     * Maps the list of RequestComment entities to a list of RequestCommentDto.
     *
     * @param requestId the ID of the request for which comments are to be retrieved
     * @return a list of RequestCommentDto associated with the given request ID
     */
    public List<RequestCommentDto> getCommentsByRequestId(Long requestId) {
        List<RequestComment> comments = requestCommentRepository.findByRequestId(requestId);
        return comments.stream()
                       .map(requestCommentMapper::toDto)
                       .collect(Collectors.toList());
    }

    /**
     * Deletes a request commend by its ID.
     * If the request does not exist, an IllegalArgumentException is thrown.
     *
     * @param commentId the ID of the request comment to delete
     */
    public void deleteComment(Long commentId) {
        RequestComment existingSeniorRequest = requestCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + commentId));
        requestCommentRepository.delete(existingSeniorRequest);
    }
}
