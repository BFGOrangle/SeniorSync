package orangle.seniorsync.crm.requestmanagement.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.requestmanagement.dto.*;
import orangle.seniorsync.crm.requestmanagement.service.IRequestManagementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import orangle.seniorsync.crm.requestmanagement.dto.AssignRequestDto;

@Slf4j
@RestController
@RequestMapping("/api/requests")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
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
    public ResponseEntity<SeniorRequestDto> createSeniorRequest(@Valid @RequestBody CreateSeniorRequestDto createSeniorRequestDto) {
        SeniorRequestDto createdSeniorRequest = requestManagementService.createRequest(createSeniorRequestDto);
        log.info("Created new senior request with ID: {}", createdSeniorRequest.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSeniorRequest);
    }

    @GetMapping
    public ResponseEntity<List<SeniorRequestDto>> getRequests(@RequestBody(required = false) SeniorRequestFilterDto filter) {
        List<SeniorRequestDto> seniorRequests = requestManagementService.findRequests(filter);
        log.info("Retrieved {} senior requests", seniorRequests.size());
        return ResponseEntity.ok().body(seniorRequests);
    }

    @PutMapping
    public ResponseEntity<SeniorRequestDto> updateRequestStatus(@Valid @RequestBody UpdateSeniorRequestDto updateSeniorRequestDto) {
        SeniorRequestDto updatedSeniorRequest = requestManagementService.updateRequest(updateSeniorRequestDto);
        log.info("Updated senior request with ID: {}", updatedSeniorRequest.id());
        return ResponseEntity.ok().body(updatedSeniorRequest);
    }

    /**
     * Assign or reassign a request to a staff member
     * Business rules enforced in service layer:
     * - Admin can assign to anyone
     * - Staff can only assign unassigned requests to themselves
     *
     * @param requestId the ID of the request to assign
     * @param assignRequestDto the assignment details
     * @return updated SeniorRequestDto with HTTP 200
     */
    @PutMapping("/{requestId}/assign")
    public ResponseEntity<SeniorRequestDto> assignRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody AssignRequestDto assignRequestDto) {
        SeniorRequestDto assignedRequest = requestManagementService.assignRequest(requestId, assignRequestDto);
        log.info("Assigned request {} to staff ID: {}", requestId, assignRequestDto.assignedStaffId());
        return ResponseEntity.ok().body(assignedRequest);
    }

    /**
     * Unassign a request (remove assignment)
     * Business rules enforced in service layer:
     * - Admin can unassign any request
     * - Staff can only unassign requests assigned to themselves
     *
     * @param requestId the ID of the request to unassign
     * @return updated SeniorRequestDto with HTTP 200
     */
    @DeleteMapping("/{requestId}/assign")
    public ResponseEntity<SeniorRequestDto> unassignRequest(@PathVariable Long requestId) {
        SeniorRequestDto unassignedRequest = requestManagementService.unassignRequest(requestId);
        log.info("Unassigned request {}", requestId);
        return ResponseEntity.ok().body(unassignedRequest);
    }

    @GetMapping("/senior/{id}")
    public ResponseEntity<List<SeniorRequestDto>> getRequestsBySenior(@PathVariable long id) {
        List<SeniorRequestDto> seniorRequests = requestManagementService.findRequestsBySenior(id);
        log.info("Retrieved {} senior requests for senior ID: {}", seniorRequests.size(), id);
        return ResponseEntity.ok().body(seniorRequests);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable long id) {
        requestManagementService.deleteRequest(id);
        log.info("Deleted senior request with ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeniorRequestDto> getRequestById(@PathVariable long id) {
        SeniorRequestDto seniorRequest = requestManagementService.findRequestById(id);
        log.info("Retrieved senior request with ID: {}", id);
        return ResponseEntity.ok().body(seniorRequest);
    }

    @GetMapping("/filter-options")
    public ResponseEntity<RequestFilterOptionsDto> getFilterOptions() {
        RequestFilterOptionsDto options = requestManagementService.getFilterOptions();
        log.info("Retrieved filter options");
        return ResponseEntity.ok().body(options);
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<SeniorRequestDto>> getMyRequests(@RequestBody(required = false) SeniorRequestFilterDto filter) {
        List<SeniorRequestDto> myRequests = requestManagementService.findMyRequests(filter);
        log.info("Retrieved {} requests for current user", myRequests.size());
        return ResponseEntity.ok().body(myRequests);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        DashboardDto dashboard = requestManagementService.getDashboard();
        log.info("Retrieved dashboard data");
        return ResponseEntity.ok().body(dashboard);
    }

    @GetMapping("/dashboard/personal")
    public ResponseEntity<DashboardDto> getPersonalDashboard() {
        DashboardDto dashboard = requestManagementService.getPersonalDashboard();
        log.info("Retrieved personal dashboard data");
        return ResponseEntity.ok().body(dashboard);
    }

    @GetMapping("/dashboard/center")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardDto> getCenterDashboard() {
        DashboardDto dashboard = requestManagementService.getCenterDashboard();
        log.info("Retrieved center dashboard data");
        return ResponseEntity.ok().body(dashboard);
    }
}
