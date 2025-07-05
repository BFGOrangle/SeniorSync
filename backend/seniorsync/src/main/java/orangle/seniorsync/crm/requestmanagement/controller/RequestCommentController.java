package orangle.seniorsync.crm.requestmanagement.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.requestmanagement.dto.CreateCommentDto;
import orangle.seniorsync.crm.requestmanagement.dto.RequestCommentDto;
import orangle.seniorsync.crm.requestmanagement.mapper.RequestCommentMapper;
import orangle.seniorsync.crm.requestmanagement.service.IRequestCommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/comments")
public class RequestCommentController {

    private final IRequestCommentService requestCommentService;

    public RequestCommentController(IRequestCommentService requestCommentService) {
        this.requestCommentService = requestCommentService;
    }

    @PostMapping
    public ResponseEntity<RequestCommentDto> createComment(@Valid @RequestBody CreateCommentDto createCommentDto) {
        RequestCommentDto createdCommentDto = requestCommentService.createComment(createCommentDto);
        log.info("Created comment with ID : {}", createdCommentDto.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCommentDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<RequestCommentDto>> getCommentsById(@PathVariable("id") Long id) {
        List<RequestCommentDto> comments = requestCommentService.getCommentsByRequestId(id);
        log.info("Retrieved {} comments for request ID: {}", comments.size(), id);
        return ResponseEntity.ok().body(comments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable("id") Long id) {
        requestCommentService.deleteComment(id);
        log.info("Deleted comment with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
