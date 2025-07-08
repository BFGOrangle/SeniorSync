package orangle.seniorsync.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * JWT Configuration and Validation
 * 
 * Provides centralized JWT configuration and validates JWT settings
 * for security compliance in production environments.
 */
@Configuration
public class JwtConfig {
    
    private static final Logger log = LoggerFactory.getLogger(JwtConfig.class);
    
    @Value("${security.jwt.enabled:true}")
    private boolean jwtEnabled;
    
    @Value("${security.jwt.secret:#{null}}")
    private String jwtSecret;
    
    @Value("${spring.profiles.active:default}")
    private String activeProfile;
    
    /**
     * Validate JWT configuration on startup
     */
    @PostConstruct
    public void validateJwtConfiguration() {
        log.info("JWT Authentication enabled: {}", jwtEnabled);
        
        if (!jwtEnabled) {
            log.warn("JWT authentication is DISABLED. This should only be used for testing!");
            return;
        }
        
        // Validate JWT secret configuration
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            log.error("JWT secret is not configured! Set NEXTAUTH_SECRET environment variable.");
            if (isProductionProfile()) {
                throw new IllegalStateException("JWT secret is required in production environment");
            }
        } else if (isWeakSecret(jwtSecret)) {
            log.warn("JWT secret appears to be weak. Use a strong, randomly generated secret for production.");
            if (isProductionProfile()) {
                throw new IllegalStateException("Weak JWT secret detected in production environment");
            }
        } else {
            log.info("JWT secret configured successfully (length: {} characters)", jwtSecret.length());
        }
        
        // Additional security checks for production
        if (isProductionProfile()) {
            validateProductionSecurity();
        }
    }
    
    /**
     * Check if current profile is production
     */
    private boolean isProductionProfile() {
        return activeProfile != null && 
               (activeProfile.contains("prod") || 
                activeProfile.contains("production"));
    }
    
    /**
     * Check if JWT secret is weak
     */
    private boolean isWeakSecret(String secret) {
        // Basic weak secret detection
        return secret.length() < 32 || 
               secret.equals("default-local-secret-change-in-production") ||
               secret.matches("^[a-zA-Z]*$") || // Only letters
               secret.matches("^[0-9]*$") ||    // Only numbers
               secret.contains("password") ||
               secret.contains("secret") ||
               secret.contains("123");
    }
    
    /**
     * Additional security validations for production
     */
    private void validateProductionSecurity() {
        log.info("Validating production security configuration...");
        
        // Ensure JWT secret is properly configured
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException("Production environment requires a JWT secret of at least 32 characters");
        }
        
        // Add more production checks as needed
        log.info("Production security validation passed");
    }
    
    /**
     * Get JWT configuration status for health checks
     */
    public JwtStatus getJwtStatus() {
        return new JwtStatus(
            jwtEnabled,
            jwtSecret != null && !jwtSecret.trim().isEmpty(),
            !isWeakSecret(jwtSecret != null ? jwtSecret : ""),
            isProductionProfile()
        );
    }
    
    /**
     * JWT Status information
     */
    public static class JwtStatus {
        private final boolean enabled;
        private final boolean secretConfigured;
        private final boolean strongSecret;
        private final boolean productionProfile;
        
        public JwtStatus(boolean enabled, boolean secretConfigured, boolean strongSecret, boolean productionProfile) {
            this.enabled = enabled;
            this.secretConfigured = secretConfigured;
            this.strongSecret = strongSecret;
            this.productionProfile = productionProfile;
        }
        
        public boolean isEnabled() { return enabled; }
        public boolean isSecretConfigured() { return secretConfigured; }
        public boolean isStrongSecret() { return strongSecret; }
        public boolean isProductionProfile() { return productionProfile; }
        
        public boolean isSecure() {
            return enabled && secretConfigured && (strongSecret || !productionProfile);
        }
    }
} 