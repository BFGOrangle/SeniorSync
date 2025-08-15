package orangle.seniorsync.common.util;

import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Utility class for accessing authenticated user information from the Security Context
 * 
 * This utility provides convenient methods to retrieve the current authenticated user's
 * information from Spring Security's SecurityContext, specifically for Cognito JWT-authenticated users.
 */
@Component
public class SecurityContextUtil {

    private final StaffRepository staffRepository;

    public SecurityContextUtil(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    /**
     * Get the current authenticated user's Cognito subject (UUID)
     *
     * @return Optional containing the Cognito sub if authenticated, empty otherwise
     */
    public static Optional<String> getCurrentCognitoSub() {
        return getCurrentJwt()
                .map(Jwt::getSubject);
    }

    /**
     * Get the current authenticated user's Cognito subject as UUID
     *
     * @return Optional containing the Cognito sub as UUID if authenticated, empty otherwise
     */
    public static Optional<UUID> getCurrentCognitoSubUUID() {
        return getCurrentCognitoSub()
                .map(sub -> {
                    try {
                        return UUID.fromString(sub);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                });
    }

    /**
     * Get the current authenticated user's staff ID, with fallback to Cognito sub lookup
     * This method requires a StaffRepository to perform the fallback lookup
     * @param staffRepository The repository to lookup staff by Cognito sub
     * @return Optional containing the staff ID if authenticated, empty otherwise
     */
    public static Optional<Long> getCurrentUserIdWithFallback(org.springframework.data.jpa.repository.JpaRepository<orangle.seniorsync.crm.staffmanagement.model.Staff, Long> staffRepository) {
        // Try to lookup staff by Cognito sub in the database
        return getCurrentCognitoSubUUID().flatMap(cognitoSub -> {
            try {
                // Use reflection to call findByCognitoSub method
                java.lang.reflect.Method method = staffRepository.getClass().getMethod("findByCognitoSub", java.util.UUID.class);
                @SuppressWarnings("unchecked")
                Optional<orangle.seniorsync.crm.staffmanagement.model.Staff> staffOpt =
                    (Optional<orangle.seniorsync.crm.staffmanagement.model.Staff>) method.invoke(staffRepository, cognitoSub);
                return staffOpt.map(staff -> staff.getId());
            } catch (Exception e) {
                return Optional.empty();
            }
        });
    }

    /**
     * Get the current authenticated user's username
     *
     * @return Optional containing the username if authenticated, empty otherwise
     */
    public static Optional<String> getCurrentUserUsername() {
        return getCurrentJwt()
                .map(jwt -> jwt.getClaimAsString("username"));
    }

    /**
     * Get the current authenticated user's email
     *
     * @return Optional containing the user email if authenticated, empty otherwise
     */
    public static Optional<String> getCurrentUserEmail() {
        return getCurrentJwt()
                .map(jwt -> jwt.getClaimAsString("email"));
    }

    /**
     * Get the current authenticated user's role from custom attributes or groups
     *
     * @return Optional containing the user role if authenticated, empty otherwise
     */
    public static Optional<String> getCurrentUserRole() {
        return getCurrentJwt().map(jwt -> {
            // Try custom role first
            String customRole = jwt.getClaimAsString("custom:role");
            if (customRole != null) {
                return customRole.toUpperCase();
            }

            // Fall back to first group
            List<String> groups = jwt.getClaimAsStringList("cognito:groups");
            if (groups != null && !groups.isEmpty()) {
                return groups.get(0).toUpperCase();
            }

            return null;
        });
    }

    /**
     * Get the current authenticated user's Cognito sub as the user identifier
     *
     * @return Optional containing the Cognito sub as Long (hash-based) if authenticated, empty otherwise
     */
    public static Optional<UUID> getCurrentCognitoUserSub() {
        return getCurrentCognitoSub()
                .flatMap(sub -> {
                    try {
                        return Optional.of(UUID.fromString(sub));
                    } catch (IllegalArgumentException e) {
                        return Optional.empty();
                    }
                });
    }

    /**
     * Get the current JWT
     *
     * @return Optional containing the JWT if authenticated, empty otherwise
     */
    public static Optional<Jwt> getCurrentJwt() {
        return getCurrentJwtToken()
                .map(JwtAuthenticationToken::getToken);
    }

    /**
     * Check if the current user is authenticated
     * 
     * @return true if user is authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Check if the current user is an admin
     * 
     * @return true if user is admin, false otherwise
     */
    public static boolean isAdmin() {
        return getCurrentUserRole()
                .map(role -> "ADMIN".equals(role))
                .orElse(false);
    }

    /**
     * Check if the current user is staff
     * 
     * @return true if user is staff, false otherwise
     */
    public static boolean isStaff() {
        return getCurrentUserRole()
                .map(role -> "STAFF".equals(role))
                .orElse(false);
    }

    /**
     * Check if the current user has a specific role
     *
     * @param role The role to check for
     * @return true if user has the role, false otherwise
     */
    public static boolean hasRole(String role) {
        return getCurrentUserRole()
                .map(userRole -> userRole.equals(role))
                .orElse(false);
    }

    /**
     * Check if the current user is in a specific Cognito group
     *
     * @param group The group to check for
     * @return true if user is in the group, false otherwise
     */
    public static boolean isInGroup(String group) {
        return getCurrentJwt().map(jwt -> {
            List<String> groups = jwt.getClaimAsStringList("cognito:groups");
            return groups != null && groups.contains(group);
        }).orElse(false);
    }

    /**
     * Get the current JWT authentication token
     * 
     * @return Optional containing the JWT authentication token if authenticated, empty otherwise
     */
    public static Optional<JwtAuthenticationToken> getCurrentJwtToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return Optional.of(jwtAuth);
        }
        
        return Optional.empty();
    }

    /**
     * Require the current user's center ID
     *
     * @return The center ID
     * @throws IllegalStateException if user is not authenticated or center ID is not available
     */
    public Long requireCurrentUserCenterId() {
        try {
            return getCurrentUserCenterId();
        } catch (RuntimeException e) {
            throw new IllegalStateException("User center ID not available", e);
        }
    }

    public Long getCurrentUserCenterId() {
        UUID cognitoSub = getCurrentCognitoSubUUID()
                .orElseThrow(() -> new RuntimeException("User not authenticated or Cognito sub not available"));
        Staff staff = staffRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        return staff.getCenter().getId();
    }

    /**
     * Require the current user's Cognito sub as UUID
     *
     * @return The Cognito sub as UUID
     * @throws IllegalStateException if user is not authenticated
     */
    public static UUID requireCurrentCognitoSubUUID() {
        return getCurrentCognitoSubUUID()
                .orElseThrow(() -> new IllegalStateException("Cognito sub not available - user may not be authenticated"));
    }

    /**
     * Require admin role for the current user
     *
     * @throws SecurityException if user is not admin
     */
    public static void requireAdmin() {
        if (!isAdmin()) {
            throw new SecurityException("Admin role required");
        }
    }

    /**
     * Check if the current user is an admin (alternative method name for compatibility)
     *
     * @return true if user is admin, false otherwise
     */
    public static boolean isCurrentUserAdmin() {
        return isAdmin();
    }
}
