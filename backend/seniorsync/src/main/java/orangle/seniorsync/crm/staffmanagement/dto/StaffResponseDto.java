package orangle.seniorsync.crm.staffmanagement.dto;

import orangle.seniorsync.common.model.RoleType;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for staff response data (excludes sensitive fields like password hash)
 */
public record StaffResponseDto(
    Long id, // Back to Long as the primary key
    UUID cognitoSub, // Add cognito sub as separate field
    Long centerId,
    String centerName,
    String firstName,
    String lastName,
    String fullName,
    String jobTitle,
    String contactPhone,
    String contactEmail,
    RoleType roleType,
    Boolean isActive,
    OffsetDateTime lastLoginAt,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
