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
import java.util.UUID;

public interface SeniorRequestRepository extends JpaRepository<SeniorRequest, Long>, JpaSpecificationExecutor<SeniorRequest> {
    // Read‐only projection by status for high‐QPS
    List<SeniorRequestView> findByStatus(RequestStatus status);
    
    // Interface projection with Specification support for center filtering
    @Query("SELECT r.id as id, r.seniorId as seniorId, r.assignedStaffId as assignedStaffId, " +
           "r.requestTypeId as requestTypeId, r.title as title, r.description as description, " +
           "r.priority as priority, r.createdAt as createdAt, r.updatedAt as updatedAt, " +
           "r.completedAt as completedAt, r.status as status " +
           "FROM SeniorRequest r WHERE r.status = :status AND r.centerId = :centerId")
    List<SeniorRequestView> findByStatusAndCenterId(@Param("status") RequestStatus status, @Param("centerId") Long centerId);

    @Query("SELECT r FROM SeniorRequest r WHERE r.seniorId = ?1")
    List<SeniorRequest> findRequestsBySenior(long seniorId);

    @Query("SELECT rt.name, COUNT(r) FROM SeniorRequest r, RequestType rt where r.requestTypeId = rt.id GROUP BY rt.name")
    List<StringCountDto> findSeniorRequestsByRequestTypeId();

    @Query("SELECT r FROM SeniorRequest r WHERE r.assignedStaffId = ?1 AND r.status != 'COMPLETED'")
    List<SeniorRequest> findIncompleteRequestsByAssignedStaffId(Long staffId);

    @Query(value = "SELECT r.* FROM senior_sync.senior_requests r JOIN senior_sync.staff s ON r.assigned_staff_id = s.id WHERE s.cognito_sub = :cognitoSub AND r.status != 'COMPLETED'", nativeQuery = true)
    List<SeniorRequest> findIncompleteRequestsByAssignedStaffCognitoSub(@Param("cognitoSub") UUID cognitoSub);

    @Query(value = "SELECT s.first_name, COUNT(r.*) FROM senior_sync.senior_requests r JOIN senior_sync.staff s ON r.assigned_staff_id = s.id GROUP BY s.first_name", nativeQuery = true)
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

    @Query("SELECT COUNT(1) FROM SeniorRequest r WHERE r.centerId = :centerId")
    Long countAllRequestsByCenter(@Param("centerId") Long centerId);

    @Query("SELECT COUNT(1) FROM SeniorRequest r WHERE r.status = 'PENDING' AND r.centerId = :centerId")
    Long countPendingRequestsByCenter(@Param("centerId") Long centerId);

    @Query("SELECT COUNT(1) FROM SeniorRequest r WHERE r.status = 'COMPLETED' AND r.centerId = :centerId AND EXTRACT(MONTH FROM r.completedAt) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM r.completedAt) = EXTRACT(YEAR FROM CURRENT_DATE)")
    Long completedThisMonthByCenter(@Param("centerId") Long centerId);


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