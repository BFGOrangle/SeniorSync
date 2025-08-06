package orangle.seniorsync.common.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

/**
 * JWT Utility class for handling both secure JWT tokens and legacy NextAuth tokens
 * 
 * Supports two token formats:
 * 1. Secure JWT tokens (recommended): Standard RFC 7519 JWT format
 * 2. Legacy tokens (deprecated): "nextauth.{userId}.{userRole}" format
 * 
 * The utility attempts to parse as secure JWT first, then falls back to legacy format
 * for backward compatibility during migration.
 */
@Component
public class JwtUtil {
    
    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);
    
    private static final String LEGACY_TOKEN_PREFIX = "nextauth.";
    private static final String BEARER_PREFIX = "Bearer ";
    
    @Value("${security.jwt.enabled:true}")
    private boolean jwtEnabled;
    
    @Value("${security.jwt.secret:#{null}}")
    private String jwtSecret;
    
    @Value("${security.jwt.expiration:86400}") // 24 hours in seconds
    private long jwtExpirationSeconds;
    
    /**
     * Generate a secure JWT token for a staff member
     * 
     * @param staffId The staff member's ID
     * @param role The staff member's role (ADMIN or STAFF)
     * @param email The staff member's email
     * @param name The staff member's full name
     * @param centerId The center ID the staff belongs to
     * @return The generated JWT token
     */
    public String generateToken(Long staffId, String role, String email, String name, Long centerId) {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret not configured");
        }
        
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (jwtExpirationSeconds * 1000));
        
        return Jwts.builder()
                .setSubject(staffId.toString())
                .claim("role", role)
                .claim("email", email)
                .claim("name", name)
                .claim("centerId", centerId)
                .setIssuer("seniorsync-crm")
                .setAudience("seniorsync-api")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
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
     * Parse JWT token - attempts secure JWT first, then falls back to legacy format
     * 
     * @param token The JWT token to parse
     * @return Optional containing parsed token data
     */
    public Optional<NextAuthTokenData> parseToken(String token) {
        if (!jwtEnabled) {
            log.debug("JWT authentication is disabled");
            return Optional.empty();
        }
        
        if (token == null || token.trim().isEmpty()) {
            log.debug("Token is null or empty");
            return Optional.empty();
        }
        
        // Try to parse as secure JWT first
        Optional<NextAuthTokenData> secureJwtResult = parseSecureJwt(token);
        if (secureJwtResult.isPresent()) {
            return secureJwtResult;
        }
        
        // Fallback to legacy format for backward compatibility
        log.debug("Secure JWT parsing failed, attempting legacy format");
        return parseLegacyToken(token);
    }
    
    /**
     * Parse secure JWT token with cryptographic validation
     * 
     * @param token The JWT token to parse
     * @return Optional containing parsed token data
     */
    private Optional<NextAuthTokenData> parseSecureJwt(String token) {
        try {
            if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
                log.debug("JWT secret not configured, skipping secure JWT parsing");
                return Optional.empty();
            }
            
            // Create signing key from secret
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            
            // Parse and validate JWT
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .requireIssuer("seniorsync-crm")
                    .requireAudience("seniorsync-api")
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // Extract user information
            String userIdStr = claims.getSubject();
            String userRole = claims.get("role", String.class);
            String userEmail = claims.get("email", String.class);
            String userName = claims.get("name", String.class);
            Long centerId = claims.get("centerId", Long.class);
            
            // Validate required fields
            if (userIdStr == null || userRole == null) {
                log.debug("JWT missing required fields: sub or role");
                return Optional.empty();
            }
            
            // Validate user ID format
            Long userId;
            try {
                userId = Long.parseLong(userIdStr);
            } catch (NumberFormatException e) {
                log.debug("Invalid user ID format in JWT: {}", userIdStr);
                return Optional.empty();
            }
            
            // Validate user role
            if (!isValidUserRole(userRole)) {
                log.debug("Invalid user role in JWT: {}", userRole);
                return Optional.empty();
            }
            
            // Check expiration (additional safety check)
            Date expiration = claims.getExpiration();
            if (expiration != null && expiration.before(new Date())) {
                log.debug("JWT token expired at: {}", expiration);
                return Optional.empty();
            }
            
            log.debug("Successfully parsed secure JWT for user: {} with role: {} and centerId: {}", userId, userRole, centerId);
            
            return Optional.of(new NextAuthTokenData(userId, userRole, userEmail, userName, centerId, true));
            
        } catch (JwtException e) {
            log.debug("JWT parsing failed: {}", e.getMessage());
            return Optional.empty();
        } catch (Exception e) {
            log.debug("Unexpected error parsing JWT: {}", e.getMessage());
            return Optional.empty();
        }
    }
    
    /**
     * Parse legacy NextAuth token format (deprecated)
     * 
     * @param token The legacy token to parse
     * @return Optional containing parsed token data
     */
    private Optional<NextAuthTokenData> parseLegacyToken(String token) {
        if (!token.startsWith(LEGACY_TOKEN_PREFIX)) {
            log.debug("Token does not start with legacy prefix: {}", LEGACY_TOKEN_PREFIX);
            return Optional.empty();
        }
        
        try {
            // Remove prefix and split by dots
            String tokenContent = token.substring(LEGACY_TOKEN_PREFIX.length());
            String[] parts = tokenContent.split("\\.");
            
            if (parts.length < 2) {
                log.debug("Legacy token does not have enough parts. Expected at least 2, got: {}", parts.length);
                return Optional.empty();
            }
            
            String userId = parts[0];
            String userRole = parts[1];
            
            // Validate userId (should be numeric)
            if (!isValidUserId(userId)) {
                log.debug("Invalid user ID format in legacy token: {}", userId);
                return Optional.empty();
            }
            
            // Validate userRole (should be ADMIN or STAFF)
            if (!isValidUserRole(userRole)) {
                log.debug("Invalid user role in legacy token: {}", userRole);
                return Optional.empty();
            }
            
            Long userIdLong = Long.parseLong(userId);
            
            log.warn("Using deprecated legacy token format for user: {} with role: {}. Please upgrade to secure JWT tokens.", userIdLong, userRole);
            
            return Optional.of(new NextAuthTokenData(userIdLong, userRole, null, null, null, false));
            
        } catch (Exception e) {
            log.debug("Error parsing legacy token: {}", e.getMessage());
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
                .flatMap(this::parseToken);
    }
    
    /**
     * Check if JWT authentication is enabled
     */
    public boolean isJwtEnabled() {
        return jwtEnabled;
    }
    
    /**
     * Enhanced data class for parsed token information
     */
    public static class NextAuthTokenData {
        private final Long userId;
        private final String userRole;
        private final String userEmail;
        private final String userName;
        private final Long centerId;
        private final boolean isSecureJwt;
        
        public NextAuthTokenData(Long userId, String userRole, String userEmail, String userName, Long centerId, boolean isSecureJwt) {
            this.userId = userId;
            this.userRole = userRole;
            this.userEmail = userEmail;
            this.userName = userName;
            this.centerId = centerId;
            this.isSecureJwt = isSecureJwt;
        }
        
        // Backward compatibility constructor
        public NextAuthTokenData(Long userId, String userRole) {
            this(userId, userRole, null, null, null, false);
        }
        
        public Long getUserId() {
            return userId;
        }
        
        public String getUserRole() {
            return userRole;
        }
        
        public String getUserEmail() {
            return userEmail;
        }
        
        public String getUserName() {
            return userName;
        }
        
        public Long getCenterId() {
            return centerId;
        }
        
        public boolean isSecureJwt() {
            return isSecureJwt;
        }
        
        public boolean isAdmin() {
            return "ADMIN".equals(userRole);
        }
        
        public boolean isStaff() {
            return "STAFF".equals(userRole);
        }
        
        @Override
        public String toString() {
            return String.format("NextAuthTokenData{userId=%d, userRole='%s', centerId=%d, isSecureJwt=%s}", 
                               userId, userRole, centerId, isSecureJwt);
        }
    }
} 