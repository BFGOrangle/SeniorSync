package orangle.seniorsync.crm.seniormanagement.repository;

import orangle.seniorsync.common.model.Senior;
import orangle.seniorsync.crm.seniormanagement.projection.SeniorView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeniorRepository extends JpaRepository<Senior, Long>, JpaSpecificationExecutor<Senior> {
    // Interface projection methods for high-throughput operations
    List<SeniorView> findByFirstNameContainingIgnoreCase(String firstName);
    List<SeniorView> findByLastNameContainingIgnoreCase(String lastName);
}