package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.crm.requestmanagement.dto.CreateCommentDto;
import orangle.seniorsync.crm.requestmanagement.dto.RequestCommentDto;

import java.util.List;

public interface IRequestCommentService {
    RequestCommentDto createComment(CreateCommentDto createCommentDto);
    List<RequestCommentDto> getCommentsByRequestId(Long requestId);
    void deleteComment(Long commentId);
}
