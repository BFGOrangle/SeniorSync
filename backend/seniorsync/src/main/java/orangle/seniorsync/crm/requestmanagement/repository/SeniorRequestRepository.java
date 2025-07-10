package orangle.seniorsync.crm.requestmanagement.repository;

import orangle.seniorsync.crm.requestmanagement.dto.RequestTypeStatusDto;
import orangle.seniorsync.crm.requestmanagement.dto.ShortCountDto;
import orangle.seniorsync.crm.requestmanagement.dto.StatusCountDto;
import orangle.seniorsync.crm.requestmanagement.dto.StringCountDto;
import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.projection.SeniorRequestView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeniorRequestRepository extends JpaRepository<SeniorRequest, Long>, JpaSpecificationExecutor<SeniorRequest> {
    // Read‐only projection by status for high‐QPS
    List<SeniorRequestView> findByStatus(RequestStatus status);

    @Query("SELECT r FROM SeniorRequest r WHERE r.seniorId = ?1")
    List<SeniorRequest> findRequestsBySenior(long seniorId);

    @Query("SELECT rt.name, COUNT(r) FROM SeniorRequest r, RequestType rt where r.requestTypeId = rt.id GROUP BY rt.name")
    List<StringCountDto> findSeniorRequestsByRequestTypeId();

    @Query("SELECT  s.firstName, COUNT(r) FROM SeniorRequest r, Staff s where r.assignedStaffId = s.id GROUP BY s.firstName")
    List<StringCountDto> findCountsByAssignedStaffId();

    @Query("SELECT to_char(r.createdAt, 'mm/yyyy'), COUNT(r) FROM SeniorRequest r GROUP BY to_char(r.createdAt, 'mm/yyyy')")
    List<StringCountDto> findCountsByMonthAndYear();

    @Query("SELECT r.priority, COUNT(r) FROM SeniorRequest r GROUP BY r.priority")
    List<ShortCountDto>  findCountsByPriority();

    @Query("SELECT r.status, COUNT(r) FROM SeniorRequest r GROUP BY r.status")
    List<StatusCountDto> findCountsByStatus();

    @Query("SELECT rt.name, r.status, COUNT(r) FROM SeniorRequest r, RequestType rt where r.requestTypeId = rt.id GROUP BY rt.name, r.status")
    List<RequestTypeStatusDto> findCountByRequestTypeIdAndStatus();

    @Query("SELECT COUNT(1) FROM SeniorRequest r where r.status = 'IN_PROGRESS'")
    Long countPendingRequests();

    @Query("SELECT COUNT(1) FROM SeniorRequest r where r.status = 'COMPLETED' AND EXTRACT(MONTH FROM r.completedAt) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM r.completedAt) = EXTRACT(YEAR FROM CURRENT_DATE)")
    Long completedThisMonth();

    @Query("SELECT COUNT(1) FROM SeniorRequest r")
    Long countAllRequests();

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) / 3600) FROM senior_sync.senior_requests r WHERE r.status = 'COMPLETED'", nativeQuery = true)
    Double averageRequestCompletionTime();
}