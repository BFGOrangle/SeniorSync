package orangle.seniorsync.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import orangle.seniorsync.common.util.JwtUtil;
import orangle.seniorsync.common.util.JwtUtil.NextAuthTokenData;

import java.io.IOException;
import java.util.Optional;

/**
 * JWT Authentication Filter for processing NextAuth JWT tokens
 * 
 * This filter intercepts HTTP requests, extracts JWT tokens from the Authorization header,
 * validates them, and establishes the security context for authenticated users.
 * 
 * The filter is designed to work with NextAuth tokens and integrates seamlessly
 * with Spring Security's authentication framework.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";

    private final JwtUtil jwtUtil;

    /**
     * Constructor for JWT Authentication Filter
     * 
     * @param jwtUtil JWT utility for token parsing and validation
     */
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain chain) 
            throws ServletException, IOException {
        
        log.debug("Processing JWT authentication for request: {} {}", 
                 request.getMethod(), request.getRequestURI());

        // Check if JWT authentication is enabled
        if (!jwtUtil.isJwtEnabled()) {
            log.debug("JWT authentication is disabled, skipping filter");
            chain.doFilter(request, response);
            return;
        }

        // Check if already authenticated
        Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
        if (existingAuth != null && existingAuth.isAuthenticated()) {
            log.debug("Request already authenticated, skipping JWT processing");
            chain.doFilter(request, response);
            return;
        }

        // Skip authentication for public endpoints
        String requestURI = request.getRequestURI();
        if (isPublicEndpoint(requestURI)) {
            log.debug("Public endpoint, skipping JWT authentication: {}", requestURI);
            chain.doFilter(request, response);
            return;
        }

        try {
            // Attempt JWT authentication
            Optional<JwtAuthenticationToken> authToken = attemptAuthentication(request);
            
            if (authToken.isPresent() && authToken.get().isAuthenticated()) {
                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authToken.get());
                log.debug("JWT authentication successful for user: {}", authToken.get().getUserId());
            } else {
                log.debug("No valid JWT token found, continuing without authentication");
            }
            
        } catch (Exception e) {
            // Clear security context and log error
            SecurityContextHolder.clearContext();
            log.debug("JWT authentication failed, continuing without authentication: {}", e.getMessage());
        }

        // Continue the filter chain
        chain.doFilter(request, response);
    }

    /**
     * Attempt to authenticate the request using JWT token
     * 
     * @param request The HTTP request
     * @return Optional containing authentication token if successful
     */
    private Optional<JwtAuthenticationToken> attemptAuthentication(HttpServletRequest request) {
        // Extract Authorization header
        String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);
        
        if (authorizationHeader == null) {
            log.debug("No Authorization header found");
            return Optional.empty();
        }
        
        // 🔍 Debug: Log the raw authorization header
        log.info("🔑 JWT DEBUG: Authorization header received: {}", 
                 authorizationHeader.length() > 50 ? authorizationHeader.substring(0, 50) + "..." : authorizationHeader);

        // Extract and parse token
        Optional<NextAuthTokenData> tokenDataOpt = jwtUtil.extractAndParseToken(authorizationHeader);
        
        if (tokenDataOpt.isEmpty()) {
            log.warn("🚫 JWT DEBUG: Failed to parse JWT token from Authorization header");
            return Optional.empty();
        }

        NextAuthTokenData tokenData = tokenDataOpt.get();
        String token = jwtUtil.extractTokenFromHeader(authorizationHeader).orElse("");

        log.info("✅ JWT DEBUG: Successfully parsed JWT token for user: {} with role: {} (secure: {})", 
                 tokenData.getUserId(), tokenData.getUserRole(), tokenData.isSecureJwt());

        // Create authenticated token
        return Optional.of(new JwtAuthenticationToken(tokenData, token));
    }

    /**
     * Check if the request URI is a public endpoint that doesn't require authentication
     * 
     * @param requestURI The request URI
     * @return true if it's a public endpoint
     */
    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.startsWith("/api/auth/") || 
               requestURI.startsWith("/api/test/") ||
               requestURI.startsWith("/swagger-ui/") ||
               requestURI.startsWith("/v3/api-docs/");
    }

    /**
     * Custom exception for JWT authentication failures
     */
    public static class JwtAuthenticationException extends AuthenticationException {
        public JwtAuthenticationException(String message) {
            super(message);
        }

        public JwtAuthenticationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
} 