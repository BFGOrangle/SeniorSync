package orangle.seniorsync.common.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * JWT Utility class for handling NextAuth JWT tokens
 * 
 * NextAuth tokens have the format: "nextauth.{userId}.{userRole}"
 * This utility parses and validates these tokens for backend authentication.
 */
@Component
public class JwtUtil {
    
    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);
    
    private static final String TOKEN_PREFIX = "nextauth.";
    private static final String BEARER_PREFIX = "Bearer ";
    
    @Value("${security.jwt.enabled:true}")
    private boolean jwtEnabled;
    
    /**
     * Extract JWT token from Authorization header
     * 
     * @param authorizationHeader The Authorization header value
     * @return Optional containing the extracted token
     */
    public Optional<String> extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.trim().isEmpty()) {
            log.debug("Authorization header is null or empty");
            return Optional.empty();
        }
        
        if (!authorizationHeader.startsWith(BEARER_PREFIX)) {
            log.debug("Authorization header does not start with 'Bearer '");
            return Optional.empty();
        }
        
        String token = authorizationHeader.substring(BEARER_PREFIX.length()).trim();
        
        if (token.isEmpty()) {
            log.debug("Token is empty after removing Bearer prefix");
            return Optional.empty();
        }
        
        return Optional.of(token);
    }
    
    /**
     * Parse NextAuth JWT token and extract user information
     * 
     * @param token The JWT token to parse
     * @return Optional containing parsed token data
     */
    public Optional<NextAuthTokenData> parseNextAuthToken(String token) {
        if (!jwtEnabled) {
            log.debug("JWT authentication is disabled");
            return Optional.empty();
        }
        
        if (token == null || token.trim().isEmpty()) {
            log.debug("Token is null or empty");
            return Optional.empty();
        }
        
        if (!token.startsWith(TOKEN_PREFIX)) {
            log.debug("Token does not start with expected prefix: {}", TOKEN_PREFIX);
            return Optional.empty();
        }
        
        try {
            // Remove prefix and split by dots
            String tokenContent = token.substring(TOKEN_PREFIX.length());
            String[] parts = tokenContent.split("\\.");
            
            if (parts.length < 2) {
                log.debug("Token does not have enough parts. Expected at least 2, got: {}", parts.length);
                return Optional.empty();
            }
            
            String userId = parts[0];
            String userRole = parts[1];
            
            // Validate userId (should be numeric)
            if (!isValidUserId(userId)) {
                log.debug("Invalid user ID format: {}", userId);
                return Optional.empty();
            }
            
            // Validate userRole (should be ADMIN or STAFF)
            if (!isValidUserRole(userRole)) {
                log.debug("Invalid user role: {}", userRole);
                return Optional.empty();
            }
            
            Long userIdLong = Long.parseLong(userId);
            
            log.debug("Successfully parsed NextAuth token for user: {} with role: {}", userIdLong, userRole);
            
            return Optional.of(new NextAuthTokenData(userIdLong, userRole));
            
        } catch (Exception e) {
            log.debug("Error parsing NextAuth token: {}", e.getMessage());
            return Optional.empty();
        }
    }
    
    /**
     * Validate user ID format
     */
    private boolean isValidUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }
        
        try {
            Long.parseLong(userId);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    /**
     * Validate user role
     */
    private boolean isValidUserRole(String userRole) {
        return userRole != null && 
               (userRole.equals("ADMIN") || userRole.equals("STAFF"));
    }
    
    /**
     * Extract token from Authorization header and parse it
     * 
     * @param authorizationHeader The Authorization header value
     * @return Optional containing parsed token data
     */
    public Optional<NextAuthTokenData> extractAndParseToken(String authorizationHeader) {
        return extractTokenFromHeader(authorizationHeader)
                .flatMap(this::parseNextAuthToken);
    }
    
    /**
     * Check if JWT authentication is enabled
     */
    public boolean isJwtEnabled() {
        return jwtEnabled;
    }
    
    /**
     * Data class for parsed NextAuth token information
     */
    public static class NextAuthTokenData {
        private final Long userId;
        private final String userRole;
        
        public NextAuthTokenData(Long userId, String userRole) {
            this.userId = userId;
            this.userRole = userRole;
        }
        
        public Long getUserId() {
            return userId;
        }
        
        public String getUserRole() {
            return userRole;
        }
        
        public boolean isAdmin() {
            return "ADMIN".equals(userRole);
        }
        
        public boolean isStaff() {
            return "STAFF".equals(userRole);
        }
        
        @Override
        public String toString() {
            return String.format("NextAuthTokenData{userId=%d, userRole='%s'}", userId, userRole);
        }
    }
} 