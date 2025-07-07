package orangle.seniorsync.crm.requestmanagement.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.requestmanagement.dto.CreateSeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestFilterDto;
import orangle.seniorsync.crm.requestmanagement.dto.UpdateSeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.service.IRequestManagementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/requests")
public class RequestManagementController {

    private final IRequestManagementService requestManagementService;

    public RequestManagementController(IRequestManagementService requestManagementService) {
        this.requestManagementService = requestManagementService;
    }

    /**
     * Create a new senior request.
     *
     * @param createSeniorRequestDto creation payload; bean validation is triggered by @Valid; 400 will be returned on validation errors
     * @return created SeniorRequestDto with HTTP 201
     * <p>
     * Note that this(or all) endpoint will return 500 on any uncaught exception by spring's global default exception handler, so no need try catch
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<SeniorRequestDto> createSeniorRequest(@Valid @RequestBody CreateSeniorRequestDto createSeniorRequestDto) {
        SeniorRequestDto createdSeniorRequest = requestManagementService.createRequest(createSeniorRequestDto);
        log.info("Created new senior request with ID: {}", createdSeniorRequest.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSeniorRequest);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<SeniorRequestDto>> getRequests(@RequestBody(required = false) SeniorRequestFilterDto filter) {
        List<SeniorRequestDto> seniorRequests = requestManagementService.findRequests(filter);
        log.info("Retrieved {} senior requests", seniorRequests.size());
        return ResponseEntity.ok().body(seniorRequests);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<SeniorRequestDto> updateRequestStatus(@Valid @RequestBody UpdateSeniorRequestDto updateSeniorRequestDto) {
        SeniorRequestDto updatedSeniorRequest = requestManagementService.updateRequest(updateSeniorRequestDto);
        log.info("Updated senior request with ID: {}", updatedSeniorRequest.id());
        return ResponseEntity.ok().body(updatedSeniorRequest);
    }

    @GetMapping("/senior/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<SeniorRequestDto>> getRequestsBySenior(@PathVariable long id) {
        List<SeniorRequestDto> seniorRequests = requestManagementService.findRequestsBySenior(id);
        log.info("Retrieved {} senior requests for senior ID: {}", seniorRequests.size(), id);
        return ResponseEntity.ok().body(seniorRequests);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteRequest(@PathVariable long id) {
        requestManagementService.deleteRequest(id);
        log.info("Deleted senior request with ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<SeniorRequestDto> getRequestById(@PathVariable long id) {
        SeniorRequestDto seniorRequest = requestManagementService.findRequestById(id);
        log.info("Retrieved senior request with ID: {}", id);
        return ResponseEntity.ok().body(seniorRequest);
    }
}
