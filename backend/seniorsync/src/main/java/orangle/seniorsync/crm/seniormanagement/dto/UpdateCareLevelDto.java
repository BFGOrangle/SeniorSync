package orangle.seniorsync.crm.seniormanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for updating an existing care level
 */
public record UpdateCareLevelDto(
        @NotNull(message = "Care level ID is required")
        Long id,
        
        @NotBlank(message = "Care level name is required")
        @Size(max = 50, message = "Care level name must not exceed 50 characters")
        String careLevel,
        
        @NotBlank(message = "Care level color is required")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Care level color must be a valid hex color (e.g., #FF5733)")
        String careLevelColor
) {
}
