package orangle.seniorsync.crm.seniormanagement.repository;

import orangle.seniorsync.common.model.CareLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CareLevelTypesRepository extends JpaRepository<CareLevel, Long>, JpaSpecificationExecutor<CareLevel> {

    /**
     * Find care level by ID and center ID for multi-tenancy
     */
    @Query("SELECT cl FROM CareLevel cl WHERE cl.id = :id AND cl.center.id = :centerId")
    Optional<CareLevel> findByIdAndCenterId(@Param("id") Long id, @Param("centerId") Long centerId);

    /**
     * Find all care levels for a specific center
     */
    @Query("SELECT cl FROM CareLevel cl WHERE cl.center.id = :centerId ORDER BY cl.careLevel")
    List<CareLevel> findByCenterIdOrderByCareLevel(@Param("centerId") Long centerId);

    /**
     * Check if care level exists with same name in center (for validation)
     */
    @Query("SELECT COUNT(cl) > 0 FROM CareLevel cl WHERE cl.careLevel = :careLevel AND cl.center.id = :centerId")
    boolean existsByCareLevelAndCenterId(@Param("careLevel") String careLevel, @Param("centerId") Long centerId);

    /**
     * Check if care level exists with same name in center, excluding a specific ID (for updates)
     */
    @Query("SELECT COUNT(cl) > 0 FROM CareLevel cl WHERE cl.careLevel = :careLevel AND cl.center.id = :centerId AND cl.id != :excludeId")
    boolean existsByCareLevelAndCenterIdAndIdNot(@Param("careLevel") String careLevel, @Param("centerId") Long centerId, @Param("excludeId") Long excludeId);
}
