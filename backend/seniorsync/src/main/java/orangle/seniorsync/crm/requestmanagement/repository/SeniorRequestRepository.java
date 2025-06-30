package orangle.seniorsync.crm.requestmanagement.repository;

import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.projection.SeniorRequestView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeniorRequestRepository extends JpaRepository<SeniorRequest, Long>, JpaSpecificationExecutor<SeniorRequest> {
    // Read‐only projection by status for high‐QPS
    List<SeniorRequestView> findByStatus(RequestStatus status);
}