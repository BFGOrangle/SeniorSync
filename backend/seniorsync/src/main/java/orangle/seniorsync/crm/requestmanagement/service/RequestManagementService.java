package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.common.util.TimeUtils;
import orangle.seniorsync.crm.requestmanagement.dto.*;
import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import orangle.seniorsync.crm.requestmanagement.mapper.CreateSeniorRequestMapper;
import orangle.seniorsync.crm.requestmanagement.mapper.SeniorRequestMapper;
import orangle.seniorsync.crm.requestmanagement.mapper.UpdateSeniorRequestMapper;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.projection.SeniorRequestView;
import orangle.seniorsync.crm.requestmanagement.repository.SeniorRequestRepository;
import orangle.seniorsync.crm.requestmanagement.spec.SeniorRequestSpecs;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RequestManagementService implements IRequestManagementService {

    private final SeniorRequestRepository seniorRequestRepository;
    private final CreateSeniorRequestMapper createSeniorRequestMapper;
    private final SeniorRequestMapper seniorRequestMapper;
    private final UpdateSeniorRequestMapper updateSeniorRequestMapper;

    public RequestManagementService(
            SeniorRequestRepository seniorRequestRepository,
            CreateSeniorRequestMapper createSeniorRequestMapper,
            SeniorRequestMapper seniorRequestMapper,
            UpdateSeniorRequestMapper updateSeniorRequestMapper) {
        this.seniorRequestRepository = seniorRequestRepository;
        this.createSeniorRequestMapper = createSeniorRequestMapper;
        this.seniorRequestMapper = seniorRequestMapper;
        this.updateSeniorRequestMapper = updateSeniorRequestMapper;
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
        List<SeniorRequest> seniorRequestsQueryResult;
        // If no filter is provided, return all senior requests.
        if (filter == null) {
            seniorRequestsQueryResult = seniorRequestRepository.findAll();
        } else {
            var spec = Specification.allOf(
                    SeniorRequestSpecs.hasStatus(filter.status()),
                    SeniorRequestSpecs.hasSeniorId(filter.seniorId()),
                    SeniorRequestSpecs.hasAssignedStaffId(filter.assignedStaffId()),
                    SeniorRequestSpecs.priorityBetween(filter.minPriority(), filter.maxPriority()),
                    SeniorRequestSpecs.createdInRange(filter.createdAfter(), filter.createdBefore())
            );
            seniorRequestsQueryResult = seniorRequestRepository.findAll(spec);
        }

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
     *
     * @param status the status of the senior requests to filter by
     * @return a list of SeniorRequestView projections for the specified status
     */
    public List<SeniorRequestView> findRequestsByStatus(RequestStatus status) {
        // Why use Interface projection here? (Notice how we use SeniorRequestView instead of SeniorRequestDto)
        // For High QPS endpoints, switching your hot read paths from loading full SeniorRequest entities to using interface (or constructor) projections can yield substantially better throughput and lower latency.
        // Furthermore, we want to avoid the overhead of mapping the entire entity to a DTO.
        return seniorRequestRepository.findByStatus(status);
    }

    public SeniorRequestDto updateRequest(UpdateSeniorRequestDto updateSeniorRequestDto) {
        SeniorRequest existingSeniorRequest = seniorRequestRepository.findById(updateSeniorRequestDto.id())
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + updateSeniorRequestDto.id()));
        // Update existing request object with the new values from the DTO in place
        updateSeniorRequestMapper.updateExitingSeniorRequestFromDto(updateSeniorRequestDto, existingSeniorRequest);
        if (existingSeniorRequest.getStatus() == RequestStatus.COMPLETED) {
            existingSeniorRequest.setCompletedAt(TimeUtils.getUtcTimeNow());
        }
        seniorRequestRepository.save(existingSeniorRequest);
        return seniorRequestMapper.toDto(existingSeniorRequest);
    }

    public List<SeniorRequestDto> findRequestsBySenior(long id) {
        List<SeniorRequest> seniorRequests = seniorRequestRepository.findRequestsBySenior(id);
        return seniorRequests.stream()
                .map(seniorRequestMapper::toDto)
                .toList();
    }

    /**
     * Deletes a senior request by its ID.
     * If the request does not exist, an IllegalArgumentException is thrown.
     *
     * @param id the ID of the senior request to delete
     */
    public void deleteRequest(long id) {
        SeniorRequest existingSeniorRequest = seniorRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));
        seniorRequestRepository.delete(existingSeniorRequest);
    }

    public SeniorRequestDto findRequestById(long id) {
        SeniorRequest seniorRequest = seniorRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));
        return seniorRequestMapper.toDto(seniorRequest);
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
}
