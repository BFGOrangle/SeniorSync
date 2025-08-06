package orangle.seniorsync.common.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import orangle.seniorsync.common.util.SecurityContextUtil;

/**
 * Aspect that automatically applies tenant filtering based on the current user's center ID.
 * This ensures data isolation between different centers in a multi-tenant environment.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class TenantFilterAspect {

    private final EntityManager entityManager;

    /**
     * Apply tenant filter before any service method execution in the CRM package.
     * This intercepts all public methods in services to ensure tenant isolation.
     */
    @Before("execution(* orangle.seniorsync.crm..*Service.*(..))")
    public void activateTenantFilter() {
        SecurityContextUtil.getCurrentCenterId().ifPresent(centerId -> {
            try {
                Session session = entityManager.unwrap(Session.class);
                session.enableFilter("tenantFilter").setParameter("centerId", centerId);
                log.debug("Enabled tenant filter for center ID: {}", centerId);
            } catch (Exception e) {
                log.error("Failed to enable tenant filter for center ID: {}", centerId, e);
            }
        });
    }

    /**
     * Apply tenant filter for repository methods as well.
     * This provides an additional layer of security at the repository level.
     */
    @Before("execution(* orangle.seniorsync..*Repository.*(..))")
    public void activateTenantFilterForRepositories() {
        SecurityContextUtil.getCurrentCenterId().ifPresent(centerId -> {
            try {
                Session session = entityManager.unwrap(Session.class);
                session.enableFilter("tenantFilter").setParameter("centerId", centerId);
                log.debug("Enabled tenant filter for repository access, center ID: {}", centerId);
            } catch (Exception e) {
                log.error("Failed to enable tenant filter for repository, center ID: {}", centerId, e);
            }
        });
    }
}
