package orangle.seniorsync.common.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import orangle.seniorsync.common.security.JwtAuthenticationToken;
import orangle.seniorsync.common.util.JwtUtil.NextAuthTokenData;

import java.util.Optional;

/**
 * Utility class for accessing authenticated user information from the Security Context
 * 
 * This utility provides convenient methods to retrieve the current authenticated user's
 * information from Spring Security's SecurityContext, specifically for JWT-authenticated users.
 */
public class SecurityContextUtil {

    /**
     * Get the current authenticated user's ID
     * 
     * @return Optional containing the user ID if authenticated, empty otherwise
     */
    public static Optional<Long> getCurrentUserId() {
        return getCurrentJwtToken()
                .map(JwtAuthenticationToken::getUserId);
    }

    /**
     * Get the current authenticated user's role
     * 
     * @return Optional containing the user role if authenticated, empty otherwise
     */
    public static Optional<String> getCurrentUserRole() {
        return getCurrentJwtToken()
                .map(JwtAuthenticationToken::getUserRole);
    }

    /**
     * Get the current authenticated user's token data
     * 
     * @return Optional containing the token data if authenticated, empty otherwise
     */
    public static Optional<NextAuthTokenData> getCurrentTokenData() {
        return getCurrentJwtToken()
                .map(JwtAuthenticationToken::getTokenData);
    }

    /**
     * Check if the current user is authenticated
     * 
     * @return true if user is authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.isAuthenticated() && 
               authentication instanceof JwtAuthenticationToken;
    }

    /**
     * Check if the current user is an admin
     * 
     * @return true if user is authenticated and has admin role, false otherwise
     */
    public static boolean isCurrentUserAdmin() {
        return getCurrentJwtToken()
                .map(JwtAuthenticationToken::isAdmin)
                .orElse(false);
    }

    /**
     * Check if the current user is staff
     * 
     * @return true if user is authenticated and has staff role, false otherwise
     */
    public static boolean isCurrentUserStaff() {
        return getCurrentJwtToken()
                .map(JwtAuthenticationToken::isStaff)
                .orElse(false);
    }

    /**
     * Check if the current user has access to a specific user's data
     * This implements basic authorization logic where:
     * - Admins can access any user's data
     * - Staff can only access their own data
     * 
     * @param targetUserId The ID of the user whose data is being accessed
     * @return true if access is allowed, false otherwise
     */
    public static boolean canAccessUserData(Long targetUserId) {
        if (targetUserId == null) {
            return false;
        }

        Optional<JwtAuthenticationToken> tokenOpt = getCurrentJwtToken();
        if (tokenOpt.isEmpty()) {
            return false;
        }

        JwtAuthenticationToken token = tokenOpt.get();
        
        // Admins can access any user's data
        if (token.isAdmin()) {
            return true;
        }
        
        // Staff can only access their own data
        if (token.isStaff()) {
            Long currentUserId = token.getUserId();
            return currentUserId != null && currentUserId.equals(targetUserId);
        }
        
        return false;
    }

    /**
     * Require authentication and return the current user ID
     * 
     * @return The current user ID
     * @throws SecurityException if user is not authenticated
     */
    public static Long requireCurrentUserId() {
        return getCurrentUserId()
                .orElseThrow(() -> new SecurityException("User not authenticated"));
    }

    /**
     * Require authentication and return the current user role
     * 
     * @return The current user role
     * @throws SecurityException if user is not authenticated
     */
    public static String requireCurrentUserRole() {
        return getCurrentUserRole()
                .orElseThrow(() -> new SecurityException("User not authenticated"));
    }

    /**
     * Get the current authenticated user's center ID
     * 
     * @return Optional containing the center ID if authenticated, empty otherwise
     */
    public static Optional<Long> getCurrentUserCenterId() {
        return getCurrentJwtToken()
                .map(JwtAuthenticationToken::getCenterId);
    }

    /**
     * Require authentication and return the current user's center ID
     * 
     * @return The current user's center ID
     * @throws SecurityException if user is not authenticated
     */
    public static Long requireCurrentUserCenterId() {
        // Enhanced debugging for center ID requirement
        if (!isAuthenticated()) {
            throw new SecurityException("User not authenticated - no valid JWT token found in security context");
        }

        Optional<Long> centerIdOpt = getCurrentUserCenterId();
        if (centerIdOpt.isEmpty()) {
            Optional<JwtAuthenticationToken> tokenOpt = getCurrentJwtToken();
            if (tokenOpt.isPresent()) {
                JwtAuthenticationToken token = tokenOpt.get();
                throw new SecurityException(String.format(
                    "User authenticated but no center ID found in token. User ID: %s, Role: %s, Token data available: %s",
                    token.getUserId(),
                    token.getUserRole(),
                    token.getTokenData() != null
                ));
            } else {
                throw new SecurityException("User authenticated but JWT token is not available");
            }
        }

        return centerIdOpt.get();
    }

    /**
     * Require admin access
     * 
     * @throws SecurityException if user is not authenticated or not an admin
     */
    public static void requireAdmin() {
        if (!isCurrentUserAdmin()) {
            throw new SecurityException("Admin access required");
        }
    }

    /**
     * Get the current JWT authentication token
     * 
     * @return Optional containing the JWT token if present and valid
     */
    private static Optional<JwtAuthenticationToken> getCurrentJwtToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication instanceof JwtAuthenticationToken jwtToken && jwtToken.isAuthenticated()) {
            return Optional.of(jwtToken);
        }
        
        return Optional.empty();
    }

    /**
     * Get a string representation of the current authentication context
     * Useful for logging and debugging
     * 
     * @return String representation of current authentication
     */
    public static String getCurrentAuthenticationInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            return "No authentication";
        }
        
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            return String.format("JWT Auth - User: %s, Role: %s, Authenticated: %s",
                    jwtToken.getUserId(), jwtToken.getUserRole(), jwtToken.isAuthenticated());
        }
        
        return String.format("Other Auth - Type: %s, Principal: %s, Authenticated: %s",
                authentication.getClass().getSimpleName(), 
                authentication.getPrincipal(), 
                authentication.isAuthenticated());
    }
}
