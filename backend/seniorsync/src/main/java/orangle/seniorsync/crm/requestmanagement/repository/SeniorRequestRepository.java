package orangle.seniorsync.crm.requestmanagement.repository;

import orangle.seniorsync.crm.requestmanagement.dto.*;
import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.projection.SeniorRequestView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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

    // Personal dashboard methods - filtered by assigned staff ID
    @Query("SELECT rt.name, COUNT(r) FROM SeniorRequest r, RequestType rt where r.requestTypeId = rt.id AND r.assignedStaffId = :staffId GROUP BY rt.name")
    List<StringCountDto> findPersonalRequestsByRequestTypeId(@Param("staffId") Long staffId);

    @Query("SELECT to_char(r.createdAt, 'mm/yyyy'), COUNT(r) FROM SeniorRequest r WHERE r.assignedStaffId = :staffId GROUP BY to_char(r.createdAt, 'mm/yyyy')")
    List<StringCountDto> findPersonalCountsByMonthAndYear(@Param("staffId") Long staffId);

    @Query("SELECT r.priority, COUNT(r) FROM SeniorRequest r WHERE r.assignedStaffId = :staffId GROUP BY r.priority")
    List<ShortCountDto> findPersonalCountsByPriority(@Param("staffId") Long staffId);

    @Query("SELECT r.status, COUNT(r) FROM SeniorRequest r WHERE r.assignedStaffId = :staffId GROUP BY r.status")
    List<StatusCountDto> findPersonalCountsByStatus(@Param("staffId") Long staffId);

    @Query("SELECT rt.name, r.status, COUNT(r) FROM SeniorRequest r, RequestType rt where r.requestTypeId = rt.id AND r.assignedStaffId = :staffId GROUP BY rt.name, r.status")
    List<RequestTypeStatusDto> findPersonalCountByRequestTypeIdAndStatus(@Param("staffId") Long staffId);

    @Query("SELECT COUNT(1) FROM SeniorRequest r WHERE r.status = 'IN_PROGRESS' AND r.assignedStaffId = :staffId")
    Long countPersonalPendingRequests(@Param("staffId") Long staffId);

    @Query("SELECT COUNT(1) FROM SeniorRequest r WHERE r.status = 'COMPLETED' AND r.assignedStaffId = :staffId AND EXTRACT(MONTH FROM r.completedAt) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM r.completedAt) = EXTRACT(YEAR FROM CURRENT_DATE)")
    Long personalCompletedThisMonth(@Param("staffId") Long staffId);

    @Query("SELECT COUNT(1) FROM SeniorRequest r WHERE r.assignedStaffId = :staffId")
    Long countPersonalAllRequests(@Param("staffId") Long staffId);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) / 3600) FROM senior_sync.senior_requests r WHERE r.status = 'COMPLETED' AND r.assigned_staff_id = :staffId", nativeQuery = true)
    Double averagePersonalRequestCompletionTime(@Param("staffId") Long staffId);
}