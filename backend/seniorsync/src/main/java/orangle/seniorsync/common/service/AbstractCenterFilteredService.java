package orangle.seniorsync.common.service;

import orangle.seniorsync.common.util.SecurityContextUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Abstract base service that automatically applies center-based filtering for multi-tenant operations.
 * 
 * This service ensures that all data access is automatically scoped to the current user's center,
 * providing transparent multi-tenancy without requiring explicit center filtering in each method.
 * 
 * @param <T> The entity type that has a center relationship
 * @param <ID> The ID type of the entity
 */
public abstract class AbstractCenterFilteredService<T, ID> {

    private static final Logger log = LoggerFactory.getLogger(AbstractCenterFilteredService.class);

    /**
     * Get the repository for this service. Must be implemented by subclasses.
     * 
     * @return The JPA repository with specification support
     */
    protected abstract JpaSpecificationExecutor<T> getRepository();

    /**
     * Create a specification that filters by the current user's center.
     * Must be implemented by subclasses to define how center filtering works for their entity.
     * 
     * @param centerId The center ID to filter by
     * @return Specification for center filtering
     */
    protected abstract Specification<T> createCenterFilterSpec(Long centerId);

    /**
     * Apply center filtering to any given specification.
     * This method automatically adds center filtering to any existing specification.
     * 
     * @param userSpec The user-provided specification (can be null)
     * @return Combined specification with center filtering
     */
    protected Specification<T> applyCenterFilter(Specification<T> userSpec) {
        // Debug authentication state
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.debug("=== Authentication Debug Info ===");
        log.debug("Authentication present: {}", auth != null);

        if (auth != null) {
            log.debug("Authentication type: {}", auth.getClass().getSimpleName());
            log.debug("Is authenticated: {}", auth.isAuthenticated());
            log.debug("Principal: {}", auth.getPrincipal());
            log.debug("Authorities: {}", auth.getAuthorities());
        }

        log.debug("SecurityContextUtil.isAuthenticated(): {}", SecurityContextUtil.isAuthenticated());
        log.debug("Current user ID: {}", SecurityContextUtil.getCurrentUserId().orElse(null));
        log.debug("Current user role: {}", SecurityContextUtil.getCurrentUserRole().orElse("NONE"));
        log.debug("Current user center ID: {}", SecurityContextUtil.getCurrentUserCenterId().orElse(null));
        log.debug("================================");

        try {
            Long currentCenterId = SecurityContextUtil.requireCurrentUserCenterId();
            log.debug("Successfully obtained center ID: {}", currentCenterId);

            Specification<T> centerSpec = createCenterFilterSpec(currentCenterId);

            if (userSpec == null) {
                return centerSpec;
            }

            return Specification.allOf(centerSpec, userSpec);
        } catch (SecurityException e) {
            log.error("Authentication failed in applyCenterFilter: {}", e.getMessage());
            log.error("This suggests the request is not properly authenticated or the JWT token is invalid/expired");
            throw e;
        }
    }

    /**
     * Find all entities with automatic center filtering applied.
     * 
     * @param spec User-provided specification (optional)
     * @param pageable Pagination parameters
     * @return Page of entities filtered by center
     */
    protected Page<T> findAllWithCenterFilter(Specification<T> spec, Pageable pageable) {
        Specification<T> finalSpec = applyCenterFilter(spec);
        return getRepository().findAll(finalSpec, pageable);
    }

    /**
     * Find all entities with automatic center filtering applied (without pagination).
     * 
     * @param spec User-provided specification (optional)
     * @return List of entities filtered by center
     */
    protected java.util.List<T> findAllWithCenterFilter(Specification<T> spec) {
        Specification<T> finalSpec = applyCenterFilter(spec);
        return getRepository().findAll(finalSpec);
    }

    /**
     * Count entities with automatic center filtering applied.
     * 
     * @param spec User-provided specification (optional)
     * @return Count of entities filtered by center
     */
    protected long countWithCenterFilter(Specification<T> spec) {
        Specification<T> finalSpec = applyCenterFilter(spec);
        return getRepository().count(finalSpec);
    }

    /**
     * Check if an entity exists with automatic center filtering applied.
     * 
     * @param spec User-provided specification (optional)
     * @return true if entity exists in current user's center
     */
    protected boolean existsWithCenterFilter(Specification<T> spec) {
        Specification<T> finalSpec = applyCenterFilter(spec);
        return getRepository().count(finalSpec) > 0;
    }
}
