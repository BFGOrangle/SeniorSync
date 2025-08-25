package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.common.service.AbstractCenterFilteredService;
import orangle.seniorsync.common.service.IUserContextService;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.common.util.TimeUtils;
import orangle.seniorsync.crm.requestmanagement.dto.*;
import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import orangle.seniorsync.crm.requestmanagement.mapper.CreateSeniorRequestMapper;
import orangle.seniorsync.crm.requestmanagement.mapper.SeniorRequestMapper;
import orangle.seniorsync.crm.requestmanagement.mapper.UpdateSeniorRequestMapper;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.projection.SeniorRequestView;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;
import orangle.seniorsync.crm.requestmanagement.repository.RequestTypeRepository;
import orangle.seniorsync.crm.requestmanagement.spec.SeniorRequestSpecs;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RequestManagementService extends AbstractCenterFilteredService<SeniorRequest, Long> implements IRequestManagementService {

    private final SeniorRequestRepository seniorRequestRepository;
    private final CreateSeniorRequestMapper createSeniorRequestMapper;
    private final SeniorRequestMapper seniorRequestMapper;
    private final UpdateSeniorRequestMapper updateSeniorRequestMapper;
    private final StaffRepository staffRepository;
    private final RequestTypeRepository requestTypeRepository;
    private final IUserContextService userContextService;

    public RequestManagementService(
            SeniorRequestRepository seniorRequestRepository,
            CreateSeniorRequestMapper createSeniorRequestMapper,
            SeniorRequestMapper seniorRequestMapper,
            UpdateSeniorRequestMapper updateSeniorRequestMapper,
            StaffRepository staffRepository,
            RequestTypeRepository requestTypeRepository,
            IUserContextService userContextService) {
        super(userContextService);
        this.seniorRequestRepository = seniorRequestRepository;
        this.createSeniorRequestMapper = createSeniorRequestMapper;
        this.seniorRequestMapper = seniorRequestMapper;
        this.updateSeniorRequestMapper = updateSeniorRequestMapper;
        this.staffRepository = staffRepository;
        this.requestTypeRepository = requestTypeRepository;
        this.userContextService = userContextService;
    }

    /**
     * Get the repository for the abstract base service
     */
    @Override
    protected JpaSpecificationExecutor<SeniorRequest> getRepository() {
        return seniorRequestRepository;
    }

    /**
     * Create center filter specification for senior requests
     */
    @Override
    protected Specification<SeniorRequest> createCenterFilterSpec(Long centerId) {
        return SeniorRequestSpecs.belongsToCenter(centerId);
    }

    /**
     * Creates a new senior request based on the provided DTO.
     * Maps the DTO to an entity, saves it to the repository, and returns the created request as a DTO.
     *
     * @param createSeniorRequestDto the DTO containing the details of the senior request to be created
     * @return the created SeniorRequestDto
     */
    public SeniorRequestDto createRequest(CreateSeniorRequestDto createSeniorRequestDto) {
        SeniorRequest seniorRequestToCreate = createSeniorRequestMapper.toEntity(createSeniorRequestDto);
        
        // Automatically set center ID from current user
        Long currentCenterId = userContextService.getRequestingUserCenterId();
        seniorRequestToCreate.setCenterId(currentCenterId);
        
        SeniorRequest createdSeniorRequest = seniorRequestRepository.save(seniorRequestToCreate);
        return seniorRequestMapper.toDto(createdSeniorRequest);
    }

    /**
     * Finds all senior requests based on the provided filter criteria.
     * Uses JPA Specifications to build a dynamic query based on the filter parameters.
     * <p>
     * This should not be used for high-QPS, read-only endpoints because:
     * <ul>
     *   <li><strong>Entity hydration & persistence‐context overhead:</strong> Hibernate must fetch every column and instantiate full JPA entities, register them in the persistence context, and track their state. This is the single largest drag on throughput.</li>
     *   <li>Additional mapping step: We then map each entity to a DTO in Java—incurring extra CPU and memory overhead.</li>
     *   <li>Unnecessary columns: Timestamps and other fields you don’t need still get fetched from the database.</li>
     * </ul>
     * For ultra-high-throughput read paths, prefer interface or constructor projections so that:
     * <ul>
     *   <li>Only the selected columns are fetched.</li>
     *   <li>No full entity instantiation or change-tracking occurs.</li>
     *   <li>No extra Java-level mapping step is required.</li>
     * </ul>
     *
     * @param filter the filter criteria for searching senior requests
     * @return a list of SeniorRequestDto matching the filter criteria
     */
    public List<SeniorRequestDto> findRequests(SeniorRequestFilterDto filter) {
        Specification<SeniorRequest> userSpec = null;
        
        // Build user specification if filter is provided
        if (filter != null) {
            userSpec = Specification.allOf(
                    SeniorRequestSpecs.hasStatus(filter.status()),
                    SeniorRequestSpecs.hasSeniorId(filter.seniorId()),
                    SeniorRequestSpecs.hasAssignedStaffId(filter.assignedStaffId()),
                    SeniorRequestSpecs.hasRequestTypeId(filter.requestTypeId()),
                    SeniorRequestSpecs.priorityBetween(filter.minPriority(), filter.maxPriority()),
                    SeniorRequestSpecs.createdInRange(filter.createdAfter(), filter.createdBefore())
            );
        }
        
        // Use abstracted method that automatically applies center filtering
        List<SeniorRequest> seniorRequestsQueryResult = findAllWithCenterFilter(userSpec);

        return seniorRequestsQueryResult.stream()
                .map(seniorRequestMapper::toDto)
                .toList();
    }

    /**
     * Finds all senior requests by their status.
     * For ultra-high-throughput read paths, we prefer interface projections so that:
     * <ul>
     *   <li>Only the selected columns are fetched from the database.</li>
     *   <li>No full entity hydration or persistence-context overhead occurs.</li>
     *   <li>No extra Java-level mapping step is required.</li>
     * </ul>
     * Center filtering is automatically applied to ensure multi-tenant isolation.
     *
     * @param status the status of the senior requests to filter by
     * @return a list of SeniorRequestView projections for the specified status
     */
    public List<SeniorRequestView> findRequestsByStatus(RequestStatus status) {
        // Why use Interface projection here? (Notice how we use SeniorRequestView instead of SeniorRequestDto)
        // For High QPS endpoints, switching your hot read paths from loading full SeniorRequest entities to using interface (or constructor) projections can yield substantially better throughput and lower latency.
        // Furthermore, we want to avoid the overhead of mapping the entire entity to a DTO.
        
        // Apply center filtering for multi-tenant isolation
        Long currentCenterId = userContextService.getRequestingUserCenterId();
        return seniorRequestRepository.findByStatusAndCenterId(status, currentCenterId);
    }

    public SeniorRequestDto updateRequest(UpdateSeniorRequestDto updateSeniorRequestDto) {
        // Create specification for ID and center filtering
        var spec = (Specification<SeniorRequest>) (root, query, cb) -> cb.equal(root.get("id"), updateSeniorRequestDto.id());
        
        // Use abstracted method that automatically applies center filtering
        List<SeniorRequest> requests = findAllWithCenterFilter(spec);
        
        if (requests.isEmpty()) {
            throw new IllegalArgumentException("Request not found with ID: " + updateSeniorRequestDto.id() + " in your center");
        }
        
        SeniorRequest existingSeniorRequest = requests.get(0);
        
        // Update existing request object with the new values from the DTO in place
        updateSeniorRequestMapper.updateExitingSeniorRequestFromDto(updateSeniorRequestDto, existingSeniorRequest);
        if (existingSeniorRequest.getStatus() == RequestStatus.COMPLETED) {
            existingSeniorRequest.setCompletedAt(TimeUtils.getUtcTimeNow());
        }
        seniorRequestRepository.save(existingSeniorRequest);
        return seniorRequestMapper.toDto(existingSeniorRequest);
    }

    public List<SeniorRequestDto> findRequestsBySenior(long id) {
        // Use specification to filter by senior ID with automatic center filtering
        var seniorSpec = SeniorRequestSpecs.hasSeniorId(id);
        List<SeniorRequest> seniorRequests = findAllWithCenterFilter(seniorSpec);
        
        return seniorRequests.stream()
                .map(seniorRequestMapper::toDto)
                .toList();
    }

    /**
     * Deletes a senior request by its ID.
     * If the request does not exist or doesn't belong to the current user's center, an IllegalArgumentException is thrown.
     *
     * @param id the ID of the senior request to delete
     */
    public void deleteRequest(long id) {
        // Create specification for ID and center filtering
        var spec = (Specification<SeniorRequest>) (root, query, cb) -> cb.equal(root.get("id"), id);
        
        // Use abstracted method that automatically applies center filtering
        List<SeniorRequest> requests = findAllWithCenterFilter(spec);
        
        if (requests.isEmpty()) {
            throw new IllegalArgumentException("Request not found with ID: " + id + " in your center");
        }
        
        SeniorRequest existingSeniorRequest = requests.get(0);
        seniorRequestRepository.delete(existingSeniorRequest);
    }

    public SeniorRequestDto findRequestById(long id) {
        // Create specification for ID and center filtering
        var spec = (Specification<SeniorRequest>) (root, query, cb) -> cb.equal(root.get("id"), id);
        
        // Use abstracted method that automatically applies center filtering
        List<SeniorRequest> requests = findAllWithCenterFilter(spec);
        
        if (requests.isEmpty()) {
            throw new IllegalArgumentException("Request not found with ID: " + id + " in your center");
        }
        
        return seniorRequestMapper.toDto(requests.get(0));
    }

    @Transactional(readOnly = true)
    public DashboardDto getDashboard() {
        Long totalRequestsCount = seniorRequestRepository.countAllRequests();
        Long pendingRequestsCount = seniorRequestRepository.countPendingRequests();
        Long completedThisMonthCount = seniorRequestRepository.completedThisMonth();
        Double averageCompletionTime = seniorRequestRepository.averageRequestCompletionTime();
        List<StringCountDto> requestsByType = seniorRequestRepository.findSeniorRequestsByRequestTypeId();
        List<StringCountDto> requestsByStaff = seniorRequestRepository.findCountsByAssignedStaffId();
        List<StringCountDto> requestsByMonth = seniorRequestRepository.findCountsByMonthAndYear();
        List<ShortCountDto> requestsByPriority = seniorRequestRepository.findCountsByPriority();
        List<StatusCountDto> requestsByStatus = seniorRequestRepository.findCountsByStatus();
        List<RequestTypeStatusDto> requestTypeStatusCounts = seniorRequestRepository.findCountByRequestTypeIdAndStatus();

        return new DashboardDto(
                totalRequestsCount,
                pendingRequestsCount,
                completedThisMonthCount,
                averageCompletionTime,
                requestsByStatus,
                requestsByType,
                requestsByPriority,
                requestsByMonth,
                requestsByStaff,
                requestTypeStatusCounts
        );
    }

    /**
     * Get personal dashboard data for the current user
     * Shows only data for requests assigned to the current user
     * Available for both ADMIN and STAFF roles
     */
    @Transactional(readOnly = true)
    public DashboardDto getPersonalDashboard() {
        // For authenticated users without staff records, return empty dashboard
        // This allows authentication to work without requiring database records
        UUID cognitoSub = SecurityContextUtil.requireCurrentCognitoSubUUID();

        // Try to get staff ID if available, otherwise use empty dashboard
        Optional<Staff> staff = staffRepository.findByCognitoSub(cognitoSub);
        if (staff.isEmpty()) {
            // Return empty dashboard for authenticated users without staff records
            return createEmptyDashboard();
        }

        Long currentUserId = staff.get().getId();

        Long totalRequestsCount = seniorRequestRepository.countPersonalAllRequests(currentUserId);
        Long pendingRequestsCount = seniorRequestRepository.countPersonalPendingRequests(currentUserId);
        Long completedThisMonthCount = seniorRequestRepository.personalCompletedThisMonth(currentUserId);
        Double averageCompletionTime = seniorRequestRepository.averagePersonalRequestCompletionTime(currentUserId);
        List<StringCountDto> requestsByType = seniorRequestRepository.findPersonalRequestsByRequestTypeId(currentUserId);
        List<StringCountDto> requestsByMonth = seniorRequestRepository.findPersonalCountsByMonthAndYear(currentUserId);
        List<ShortCountDto> requestsByPriority = seniorRequestRepository.findPersonalCountsByPriority(currentUserId);
        List<StatusCountDto> requestsByStatus = seniorRequestRepository.findPersonalCountsByStatus(currentUserId);
        List<RequestTypeStatusDto> requestTypeStatusCounts = seniorRequestRepository.findPersonalCountByRequestTypeIdAndStatus(currentUserId);
        
        // For personal dashboard, staff workload is not relevant - return empty list
        List<StringCountDto> emptyStaffWorkload = List.of();

        return new DashboardDto(
                totalRequestsCount,
                pendingRequestsCount,
                completedThisMonthCount,
                averageCompletionTime,
                requestsByStatus,
                requestsByType,
                requestsByPriority,
                requestsByMonth,
                emptyStaffWorkload,
                requestTypeStatusCounts
        );
    }

    /**
     * Create an empty dashboard for authenticated users without staff records
     */
    private DashboardDto createEmptyDashboard() {
        return new DashboardDto(
                0L,  // totalRequestsCount
                0L,  // pendingRequestsCount
                0L,  // completedThisMonthCount
                0.0, // averageCompletionTime
                List.of(), // requestsByStatus
                List.of(), // requestsByType
                List.of(), // requestsByPriority
                List.of(), // requestsByMonth
                List.of(), // staffWorkload
                List.of()  // requestTypeStatusCounts
        );
    }

    /**
     * Get the current user's staff ID
     * @return The staff ID for the current authenticated user
     * @throws IllegalStateException if user is not authenticated or doesn't have a staff record
     */
    private Long requireCurrentUserId() {
        return userContextService.getRequestingUser().getId();
    }

    /**
     * Get center-level dashboard data (all requests across the organization)
     * Only available for ADMIN role
     * This is essentially the same as getDashboard() but with explicit admin check
     */
    @Transactional(readOnly = true)
    public DashboardDto getCenterDashboard() {
        // Ensure only admins can access center dashboard
        SecurityContextUtil.requireAdmin();
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();

        Long totalRequestsCount = seniorRequestRepository.countAllRequestsByCenter(currentUserCenterId);
        Long pendingRequestsCount = seniorRequestRepository.countPendingRequestsByCenter(currentUserCenterId);
        Long completedThisMonthCount = seniorRequestRepository.centerCompletedThisMonth(currentUserCenterId);
        Double averageCompletionTime = seniorRequestRepository.averageCenterRequestCompletionTime(currentUserCenterId);
        List<StringCountDto> requestsByType = seniorRequestRepository.findCenterSeniorRequestsByRequestTypeId(currentUserCenterId);
        List<StringCountDto> requestsByStaff = seniorRequestRepository.findCenterCountsByAssignedStaffId(currentUserCenterId);
        List<StringCountDto> requestsByMonth = seniorRequestRepository.findCenterCountsByMonthAndYear(currentUserCenterId);
        List<ShortCountDto> requestsByPriority = seniorRequestRepository.findCenterCountsByPriority(currentUserCenterId);
        List<StatusCountDto> requestsByStatus = seniorRequestRepository.findCenterCountsByStatus(currentUserCenterId);
        List<RequestTypeStatusDto> requestTypeStatusCounts = seniorRequestRepository.findCenterCountByRequestTypeIdAndStatus(currentUserCenterId);

        return new DashboardDto(
                totalRequestsCount,
                pendingRequestsCount,
                completedThisMonthCount,
                averageCompletionTime,
                requestsByStatus,
                requestsByType,
                requestsByPriority,
                requestsByMonth,
                requestsByStaff,
                requestTypeStatusCounts
        );
    }

    /**
     * Assign a request to a staff member with updated role-based business rules:
     * - Both Admin and Staff can assign any request to any staff member
     * - Validates that target staff exists and belongs to same center
     *
     * @param requestId the ID of the request to assign
     * @param assignRequestDto the assignment details
     * @return the updated SeniorRequestDto
     * @throws IllegalArgumentException if request not found
     * @throws SecurityException if assignment violates business rules
     */
    @Transactional
    public SeniorRequestDto assignRequest(Long requestId, AssignRequestDto assignRequestDto) {
        // Create specification for ID and center filtering
        var spec = (Specification<SeniorRequest>) (root, query, cb) -> cb.equal(root.get("id"), requestId);
        
        // Use abstracted method that automatically applies center filtering
        List<SeniorRequest> requests = findAllWithCenterFilter(spec);
        
        if (requests.isEmpty()) {
            throw new IllegalArgumentException("Request not found with ID: " + requestId + " in your center");
        }
        
        SeniorRequest request = requests.get(0);

        Long currentUserId = requireCurrentUserId();
        boolean isAdmin = SecurityContextUtil.isCurrentUserAdmin();
        boolean isStaff = !SecurityContextUtil.isCurrentUserAdmin();
        Long targetStaffId = assignRequestDto.assignedStaffId();

        // Validate that user has permission to assign
        if (!isAdmin && !isStaff) {
            throw new SecurityException("Only admin and staff members can assign requests");
        }

        // Validate that target staff exists and belongs to same center
        // This validation applies to both admin and staff
        // TODO: Implement staff validation to ensure target staff exists and belongs to same center
        
        // Perform assignment
        request.setAssignedStaffId(targetStaffId);
        seniorRequestRepository.save(request);

        return seniorRequestMapper.toDto(request);
    }

    /**
     * Unassign a request (remove assignment) with updated role-based business rules:
     * - Both Admin and Staff can unassign any request
     *
     * @param requestId the ID of the request to unassign
     * @return the updated SeniorRequestDto
     * @throws IllegalArgumentException if request not found
     */
    @Transactional
    public SeniorRequestDto unassignRequest(Long requestId) {
        // Create specification for ID and center filtering
        var spec = (Specification<SeniorRequest>) (root, query, cb) -> cb.equal(root.get("id"), requestId);
        
        // Use abstracted method that automatically applies center filtering
        List<SeniorRequest> requests = findAllWithCenterFilter(spec);
        
        if (requests.isEmpty()) {
            throw new IllegalArgumentException("Request not found with ID: " + requestId + " in your center");
        }
        
        SeniorRequest request = requests.get(0);

        Long currentUserId = requireCurrentUserId();
        boolean isAdmin = SecurityContextUtil.isCurrentUserAdmin();
        boolean isStaff = !SecurityContextUtil.isCurrentUserAdmin();

        // Validate that user has permission to unassign
        if (!isAdmin && !isStaff) {
            throw new SecurityException("Only admin and staff members can unassign requests");
        }

        // Both admin and staff can unassign any request
        if (request.getAssignedStaffId() == null) {
            throw new SecurityException("Request is not assigned");
        }

        // Perform unassignment
        request.setAssignedStaffId(null);
        seniorRequestRepository.save(request);

        return seniorRequestMapper.toDto(request);
    }

    @Transactional(readOnly = true)
    public RequestFilterOptionsDto getFilterOptions() {
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();
        
        // Get all active staff
        List<StaffOptionDto> staffOptions = staffRepository.findByIsActiveTrue()
                .stream()
                .filter(staff -> staff.getCenter().getId().equals(currentUserCenterId))
                .map(staff -> new StaffOptionDto(
                        staff.getId(),
                        staff.getFullName(),
                        staff.getJobTitle()
                ))
                .toList();

        // Get all request types
        List<RequestTypeOptionDto> requestTypeOptions = requestTypeRepository.findAll()
                .stream()
                .map(rt -> new RequestTypeOptionDto(
                        rt.getId(),
                        rt.getName(),
                        rt.getDescription()
                ))
                .toList();

        return new RequestFilterOptionsDto(staffOptions, requestTypeOptions);
    }

    @Transactional(readOnly = true)
    public List<SeniorRequestDto> findMyRequests(SeniorRequestFilterDto filter) {
        UUID cognitoSub = SecurityContextUtil.requireCurrentCognitoSubUUID();

        // Use the new repository method that queries by Cognito UUID
        List<SeniorRequest> myRequests = seniorRequestRepository.findIncompleteRequestsByAssignedStaffCognitoSub(cognitoSub);

        // Apply additional filters if provided
        if (filter != null) {
            myRequests = myRequests.stream()
                .filter(request -> {
                    if (filter.status() != null && !filter.status().equals(request.getStatus())) {
                        return false;
                    }
                    if (filter.seniorId() != null && !filter.seniorId().equals(request.getSeniorId())) {
                        return false;
                    }
                    if (filter.requestTypeId() != null && !filter.requestTypeId().equals(request.getRequestTypeId())) {
                        return false;
                    }
                    if (filter.minPriority() != null && request.getPriority() < filter.minPriority()) {
                        return false;
                    }
                    if (filter.maxPriority() != null && request.getPriority() > filter.maxPriority()) {
                        return false;
                    }
                    if (filter.createdAfter() != null && request.getCreatedAt().isBefore(filter.createdAfter())) {
                        return false;
                    }
                    if (filter.createdBefore() != null && request.getCreatedAt().isAfter(filter.createdBefore())) {
                        return false;
                    }
                    return true;
                })
                .toList();
        }

        return myRequests.stream()
                .map(seniorRequestMapper::toDto)
                .toList();
    }
}
