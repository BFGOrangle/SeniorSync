package orangle.seniorsync.common.dto;

import orangle.seniorsync.common.model.RoleType;

import java.time.OffsetDateTime;

/**
 * Response DTO for successful authentication
 */
public record LoginResponse(
    Long staffId,
    String email,
    String firstName,
    String lastName,
    String jobTitle,
    RoleType roleType,
    OffsetDateTime lastLoginAt,
    String message
) {
    
    /**
     * Success response factory method
     */
    public static LoginResponse success(Long staffId, String email, String firstName, 
                                      String lastName, String jobTitle, RoleType roleType, 
                                      OffsetDateTime lastLoginAt) {
        return new LoginResponse(
            staffId, email, firstName, lastName, jobTitle, roleType, lastLoginAt, 
            "Login successful"
        );
    }
    
    /**
     * Error response factory method
     */
    public static LoginResponse error(String message) {
        return new LoginResponse(
            null, null, null, null, null, null, null, message
        );
    }
} 