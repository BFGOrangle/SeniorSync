package orangle.seniorsync.crm.staffmanagement.repository;

import orangle.seniorsync.common.model.RoleType;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long>, JpaSpecificationExecutor<Staff> {

    /**
     * Find staff by email for authentication
     */
    Optional<Staff> findByContactEmail(String contactEmail);
    
    /**
     * Find staff by Cognito sub
     */
    Optional<Staff> findByCognitoSub(UUID cognitoSub);

    /**
     * Find all active staff
     */
    List<Staff> findByIsActiveTrue();

    /**
     * Update last login timestamp
     */
    @Modifying
    @Query("UPDATE Staff s SET s.lastLoginAt = :loginTime WHERE s.id = :staffId")
    void updateLastLoginAt(@Param("staffId") Long staffId, @Param("loginTime") OffsetDateTime loginTime);

    /**
     * Update last login timestamp by Cognito sub
     */
    @Modifying
    @Query("UPDATE Staff s SET s.lastLoginAt = :loginTime WHERE s.cognitoSub = :cognitoSub")
    void updateLastLoginAtByCognitoSub(@Param("cognitoSub") UUID cognitoSub, @Param("loginTime") OffsetDateTime loginTime);

    /**
     * Find staff by center ID with pagination
     */
    @Query("SELECT s FROM Staff s WHERE s.center.id = :centerId")
    Page<Staff> findByCenterId(@Param("centerId") Long centerId, Pageable pageable);

    /**
     * Find all active staff by center ID
     */
    @Query("SELECT s FROM Staff s WHERE s.center.id = :centerId AND s.isActive = true")
    List<Staff> findActiveByCenterId(@Param("centerId") Long centerId);

    /**
     * Find staff by role type and center ID
     */
    @Query("SELECT s FROM Staff s WHERE s.roleType = :roleType AND s.center.id = :centerId")
    List<Staff> findByRoleTypeAndCenterId(@Param("roleType") RoleType roleType, @Param("centerId") Long centerId);

    /**
     * Count active staff by center
     */
    @Query("SELECT COUNT(s) FROM Staff s WHERE s.center.id = :centerId AND s.isActive = true")
    long countActiveByCenterId(@Param("centerId") Long centerId);
}
