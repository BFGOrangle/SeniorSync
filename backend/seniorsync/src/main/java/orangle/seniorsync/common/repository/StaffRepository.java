package orangle.seniorsync.common.repository;

import orangle.seniorsync.common.model.RoleType;
import orangle.seniorsync.common.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long>, JpaSpecificationExecutor<Staff> {
    
    /**
     * Find staff by email for authentication
     */
    Optional<Staff> findByContactEmail(String contactEmail);
    
    /**
     * Find active staff by email for authentication
     */
    Optional<Staff> findByContactEmailAndIsActiveTrue(String contactEmail);
    
    /**
     * Check if email exists
     */
    boolean existsByContactEmail(String contactEmail);
    
    /**
     * Find all staff by role type
     */
    List<Staff> findByRoleType(RoleType roleType);
    
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
     * Count staff by role type
     */
    long countByRoleType(RoleType roleType);
    
    /**
     * Count active staff
     */
    long countByIsActiveTrue();
} 