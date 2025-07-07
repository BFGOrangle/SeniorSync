package orangle.seniorsync.common.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import orangle.seniorsync.common.util.JwtUtil.NextAuthTokenData;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom authentication token for JWT-based authentication
 * 
 * This token represents an authenticated user based on a valid NextAuth JWT token.
 * It implements Spring Security's Authentication interface to integrate with
 * the security framework.
 */
public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final NextAuthTokenData tokenData;
    private final String token;

    /**
     * Create an unauthenticated token (before validation)
     * 
     * @param token The raw JWT token
     */
    public JwtAuthenticationToken(String token) {
        super(Collections.emptyList());
        this.token = token;
        this.tokenData = null;
        setAuthenticated(false);
    }

    /**
     * Create an authenticated token (after successful validation)
     * 
     * @param tokenData The parsed and validated token data
     * @param token The raw JWT token
     */
    public JwtAuthenticationToken(NextAuthTokenData tokenData, String token) {
        super(getAuthoritiesFromTokenData(tokenData));
        this.tokenData = tokenData;
        this.token = token;
        setAuthenticated(true);
    }

    /**
     * Get authorities (roles) from the token data
     */
    private static Collection<? extends GrantedAuthority> getAuthoritiesFromTokenData(NextAuthTokenData tokenData) {
        if (tokenData == null) {
            return Collections.emptyList();
        }
        
        // Convert user role to Spring Security authority
        String authority = "ROLE_" + tokenData.getUserRole();
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return tokenData != null ? tokenData.getUserId() : null;
    }

    /**
     * Get the parsed token data
     * 
     * @return The NextAuth token data, or null if not authenticated
     */
    public NextAuthTokenData getTokenData() {
        return tokenData;
    }

    /**
     * Get the raw JWT token
     * 
     * @return The raw token string
     */
    public String getToken() {
        return token;
    }

    /**
     * Get the user ID from the token
     * 
     * @return The user ID, or null if not authenticated
     */
    public Long getUserId() {
        return tokenData != null ? tokenData.getUserId() : null;
    }

    /**
     * Get the user role from the token
     * 
     * @return The user role, or null if not authenticated
     */
    public String getUserRole() {
        return tokenData != null ? tokenData.getUserRole() : null;
    }

    /**
     * Check if the authenticated user is an admin
     * 
     * @return true if user is admin, false otherwise
     */
    public boolean isAdmin() {
        return tokenData != null && tokenData.isAdmin();
    }

    /**
     * Check if the authenticated user is staff
     * 
     * @return true if user is staff, false otherwise
     */
    public boolean isStaff() {
        return tokenData != null && tokenData.isStaff();
    }

    @Override
    public String toString() {
        if (tokenData != null) {
            return String.format("JwtAuthenticationToken{userId=%d, role='%s', authenticated=%s}", 
                                tokenData.getUserId(), tokenData.getUserRole(), isAuthenticated());
        } else {
            return String.format("JwtAuthenticationToken{token='%s', authenticated=%s}", 
                                token != null ? "***" : "null", isAuthenticated());
        }
    }
} 