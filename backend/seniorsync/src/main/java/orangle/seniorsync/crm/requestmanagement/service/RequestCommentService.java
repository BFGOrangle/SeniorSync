package orangle.seniorsync.crm.requestmanagement.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.notification.dto.MentionNotificationRequest;
import orangle.seniorsync.crm.notification.service.IMentionNotificationService;
import orangle.seniorsync.crm.requestmanagement.dto.CreateCommentDto;
import orangle.seniorsync.crm.requestmanagement.dto.MentionedStaffDto;
import orangle.seniorsync.crm.requestmanagement.dto.RequestCommentDto;
import orangle.seniorsync.crm.requestmanagement.mapper.CreateCommentMapper;
import orangle.seniorsync.crm.requestmanagement.mapper.RequestCommentMapper;
import orangle.seniorsync.crm.requestmanagement.model.CommentMention;
import orangle.seniorsync.crm.requestmanagement.model.RequestComment;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.CommentMentionRepository;
import orangle.seniorsync.crm.requestmanagement.repository.RequestCommentRepository;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RequestCommentService implements IRequestCommentService {

    private final RequestCommentRepository requestCommentRepository;
    private final SeniorRequestRepository seniorRequestRepository;
    private final CommentMentionRepository commentMentionRepository;
    private final StaffRepository staffRepository;
    private final CreateCommentMapper createCommentMapper;
    private final RequestCommentMapper requestCommentMapper;
    private final IMentionNotificationService mentionNotificationService;

    public RequestCommentService(RequestCommentRepository requestCommentRepository, 
                                SeniorRequestRepository seniorRequestRepository,
                                CommentMentionRepository commentMentionRepository,
                                StaffRepository staffRepository,
                                CreateCommentMapper createCommentMapper, 
                                RequestCommentMapper requestCommentMapper,
                                IMentionNotificationService mentionNotificationService) {
        this.requestCommentRepository = requestCommentRepository;
        this.seniorRequestRepository = seniorRequestRepository;
        this.commentMentionRepository = commentMentionRepository;
        this.staffRepository = staffRepository;
        this.createCommentMapper = createCommentMapper;
        this.requestCommentMapper = requestCommentMapper;
        this.mentionNotificationService = mentionNotificationService;
    }

    /**
     * Creates a new request comment based on the provided DTO.
     * Maps the DTO to an entity, saves it to the repository, handles mentions, and returns the created request as a DTO.
     *
     * @param createCommentDto the DTO containing the details of the request comment to be created
     * @return the created RequestCommentDto
     */
    @Transactional
    public RequestCommentDto createComment(CreateCommentDto createCommentDto) {
        log.debug("Creating comment for request {} with {} mentions", 
                createCommentDto.requestId(), 
                createCommentDto.mentionedStaffIds() != null ? createCommentDto.mentionedStaffIds().size() : 0);
        
        // Create and save the comment
        RequestComment requestComment = createCommentMapper.toEntity(createCommentDto);
        requestComment.setCreatedAt(OffsetDateTime.now());
        RequestComment savedComment = requestCommentRepository.save(requestComment);
        
        // Handle mentions if present
        if (createCommentDto.mentionedStaffIds() != null && !createCommentDto.mentionedStaffIds().isEmpty()) {
            saveMentions(savedComment.getId(), createCommentDto.mentionedStaffIds());
            sendMentionNotifications(savedComment, createCommentDto);
        }
        
        // Return DTO with mention information
        return buildCommentDtoWithMentions(savedComment);
    }
    /**
     * Retrieves all comments associated with a specific request ID.
     * Maps the list of RequestComment entities to a list of RequestCommentDto with mentions.
     *
     * @param requestId the ID of the request for which comments are to be retrieved
     * @return a list of RequestCommentDto associated with the given request ID
     */
    public List<RequestCommentDto> getCommentsByRequestId(Long requestId) {
        List<RequestComment> comments = requestCommentRepository.findByRequestId(requestId);
        return comments.stream()
                       .map(this::buildCommentDtoWithMentions)
                       .collect(Collectors.toList());
    }

    /**
     * Deletes a request comment by its ID.
     * Also deletes all associated mentions.
     * If the request does not exist, an IllegalArgumentException is thrown.
     *
     * @param commentId the ID of the request comment to delete
     */
    @Transactional
    public void deleteComment(Long commentId) {
        RequestComment existingComment = requestCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with ID: " + commentId));
        
        // Delete all mentions for this comment first
        commentMentionRepository.deleteByCommentId(commentId);
        
        // Then delete the comment
        requestCommentRepository.delete(existingComment);
        
        log.debug("Deleted comment {} and its mentions", commentId);
    }
    
    /**
     * Save mentions for a comment
     */
    private void saveMentions(Long commentId, List<Long> mentionedStaffIds) {
        List<CommentMention> mentions = mentionedStaffIds.stream()
                .distinct() // Remove duplicates
                .map(staffId -> {
                    CommentMention mention = new CommentMention();
                    mention.setCommentId(commentId);
                    mention.setMentionedStaffId(staffId);
                    return mention;
                })
                .collect(Collectors.toList());
        
        commentMentionRepository.saveAll(mentions);
        log.debug("Saved {} mentions for comment {}", mentions.size(), commentId);
    }
    
    /**
     * Send mention notifications asynchronously
     */
    private void sendMentionNotifications(RequestComment comment, CreateCommentDto createCommentDto) {
        try {
            // Get request details for notification
            SeniorRequest request = seniorRequestRepository.findById(createCommentDto.requestId())
                    .orElse(null);
            
            if (request == null) {
                log.warn("Request {} not found for mention notifications", createCommentDto.requestId());
                return;
            }
            
            // Get commenter name
            Staff commenter = staffRepository.findById(createCommentDto.commenterId())
                    .orElse(null);
            String commenterName = commenter != null ? commenter.getFullName() : "Unknown User";
            
            MentionNotificationRequest notificationRequest = new MentionNotificationRequest();
            notificationRequest.setRequestId(request.getId());
            notificationRequest.setCommentId(comment.getId());
            notificationRequest.setMentionedStaffIds(createCommentDto.mentionedStaffIds());
            notificationRequest.setCommenterName(commenterName);
            notificationRequest.setCommentText(createCommentDto.comment());
            notificationRequest.setRequestTitle(request.getTitle());
            
            // Send notifications asynchronously
            mentionNotificationService.sendMentionNotificationsAsync(notificationRequest);
            
        } catch (Exception e) {
            log.error("Failed to send mention notifications for comment {}: {}", comment.getId(), e.getMessage());
            // Don't fail the comment creation if notifications fail
        }
    }
    
    /**
     * Build a RequestCommentDto with mention information
     */
    private RequestCommentDto buildCommentDtoWithMentions(RequestComment comment) {
        // Get basic DTO
        RequestCommentDto basicDto = requestCommentMapper.toDto(comment);
        
        // Get mentions for this comment
        List<CommentMention> mentions = commentMentionRepository.findByCommentId(comment.getId());
        
        if (mentions.isEmpty()) {
            // Return DTO with empty mention lists
            return new RequestCommentDto(
                    basicDto.id(),
                    basicDto.comment(),
                    basicDto.commentType(),
                    basicDto.commenterId(),
                    basicDto.requestId(),
                    basicDto.commenterName(),
                    basicDto.createdAt(),
                    basicDto.updatedAt(),
                    List.of(),
                    List.of()
            );
        }
        
        // Get staff details for mentions
        List<Long> mentionedStaffIds = mentions.stream()
                .map(CommentMention::getMentionedStaffId)
                .collect(Collectors.toList());
        
        Map<Long, Staff> staffMap = staffRepository.findAllById(mentionedStaffIds).stream()
                .collect(Collectors.toMap(Staff::getId, staff -> staff));
        
        List<MentionedStaffDto> mentionedStaff = mentionedStaffIds.stream()
                .map(staffMap::get)
                .filter(staff -> staff != null)
                .map(staff -> new MentionedStaffDto(
                        staff.getId(),
                        staff.getFullName(),
                        staff.getContactEmail()
                ))
                .collect(Collectors.toList());
        
        return new RequestCommentDto(
                basicDto.id(),
                basicDto.comment(),
                basicDto.commentType(),
                basicDto.commenterId(),
                basicDto.requestId(),
                basicDto.commenterName(),
                basicDto.createdAt(),
                basicDto.updatedAt(),
                mentionedStaffIds,
                mentionedStaff
        );
    }
}
