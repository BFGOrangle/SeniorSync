package orangle.seniorsync.crm.seniormanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.seniormanagement.dto.CareLevelDto;
import orangle.seniorsync.crm.seniormanagement.dto.CreateCareLevelDto;
import orangle.seniorsync.crm.seniormanagement.dto.UpdateCareLevelDto;
import orangle.seniorsync.crm.seniormanagement.service.ICareLevelService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/care-levels")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
@RequiredArgsConstructor
@Tag(name = "Care Level Management", description = "APIs for managing care levels in a multi-tenant environment")
public class CareLevelController {

    private final ICareLevelService careLevelService;

    @Operation(summary = "Create a new care level", description = "Creates a new care level for the current user's center. Both ADMIN and STAFF can create care levels.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Care level created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or care level already exists"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping
    public ResponseEntity<?> createCareLevel(@Valid @RequestBody CreateCareLevelDto createCareLevelDto) {
        log.info("Creating care level: {}", createCareLevelDto.careLevel());

        try {
            CareLevelDto createdCareLevel = careLevelService.createCareLevel(createCareLevelDto);
            log.info("Successfully created care level with ID: {}", createdCareLevel.id());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCareLevel);

        } catch (IllegalArgumentException e) {
            log.warn("Failed to create care level - validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (RuntimeException e) {
            log.error("Failed to create care level - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to create care level: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Update an existing care level", description = "Updates an existing care level in the current user's center. Both ADMIN and STAFF can update care levels.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Care level updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or validation error"),
            @ApiResponse(responseCode = "404", description = "Care level not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PutMapping
    public ResponseEntity<?> updateCareLevel(@Valid @RequestBody UpdateCareLevelDto updateCareLevelDto) {
        log.info("Updating care level with ID: {}", updateCareLevelDto.id());

        try {
            CareLevelDto updatedCareLevel = careLevelService.updateCareLevel(updateCareLevelDto);
            log.info("Successfully updated care level with ID: {}", updatedCareLevel.id());
            return ResponseEntity.ok(updatedCareLevel);

        } catch (IllegalArgumentException e) {
            log.warn("Failed to update care level - validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (RuntimeException e) {
            log.error("Failed to update care level - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to update care level: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Delete a care level", description = "Deletes a care level from the current user's center. Only ADMIN can delete care levels.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Care level deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Care level not found"),
            @ApiResponse(responseCode = "409", description = "Care level is in use and cannot be deleted"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin only")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Overrides class level - only admins can delete
    public ResponseEntity<?> deleteCareLevel(
            @Parameter(description = "Care level ID") @PathVariable Long id) {
        
        log.info("Deleting care level with ID: {}", id);

        try {
            careLevelService.deleteCareLevel(id);
            log.info("Successfully deleted care level with ID: {}", id);
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            log.warn("Failed to delete care level - not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();

        } catch (IllegalStateException e) {
            log.warn("Failed to delete care level - in use: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (RuntimeException e) {
            log.error("Failed to delete care level - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to delete care level: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Get care level by ID", description = "Retrieves a specific care level by ID from the current user's center")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Care level found"),
            @ApiResponse(responseCode = "404", description = "Care level not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getCareLevelById(
            @Parameter(description = "Care level ID") @PathVariable Long id) {
        
        log.info("Retrieving care level with ID: {}", id);

        try {
            Optional<CareLevelDto> careLevel = careLevelService.getCareLevelById(id);
            if (careLevel.isPresent()) {
                return ResponseEntity.ok(careLevel.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            log.error("Failed to retrieve care level - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to retrieve care level: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Get all care levels", description = "Retrieves all care levels for the current user's center")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Care levels retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping
    public ResponseEntity<?> getAllCareLevels() {
        log.info("Retrieving all care levels for current user's center");

        try {
            List<CareLevelDto> careLevels = careLevelService.getAllCareLevels();
            log.info("Retrieved {} care levels", careLevels.size());
            return ResponseEntity.ok(careLevels);
        } catch (RuntimeException e) {
            log.error("Failed to retrieve care levels - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to retrieve care levels: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Get paginated care levels", description = "Retrieves care levels with pagination for the current user's center")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paginated care levels retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/paginated")
    public ResponseEntity<?> getCareLevelsPaginated(
            @PageableDefault(size = 20, sort = {"careLevel"}) Pageable pageable) {
        
        // Limit page size to prevent large queries
        if (pageable.getPageSize() > 100) {
            pageable = PageRequest.of(pageable.getPageNumber(), 100, pageable.getSort());
        }

        log.info("Retrieving paginated care levels for current user's center with pagination: {}", pageable);

        try {
            Page<CareLevelDto> careLevelsPage = careLevelService.getCareLevelsPaginated(pageable);
            log.info("Retrieved page {} of care levels (size: {}, total: {})",
                    pageable.getPageNumber(), careLevelsPage.getNumberOfElements(), careLevelsPage.getTotalElements());
            return ResponseEntity.ok(careLevelsPage);
        } catch (RuntimeException e) {
            log.error("Failed to retrieve paginated care levels - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to retrieve care levels: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Check if care level exists", description = "Checks if a care level name already exists in the current user's center")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Check completed"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/exists")
    public ResponseEntity<?> checkCareLevelExists(
            @Parameter(description = "Care level name to check") @RequestParam String careLevel) {
        
        log.info("Checking if care level exists: {}", careLevel);

        try {
            boolean exists = careLevelService.careLevelExists(careLevel);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (RuntimeException e) {
            log.error("Failed to check care level existence - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to check care level existence: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Initialize default care levels", description = "Initializes default care levels for the current user's center if none exist. Admin only.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Default care levels initialized or already exist"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin only")
    })
    @PostMapping("/initialize-defaults")
    @PreAuthorize("hasRole('ADMIN')") // Only admins can initialize defaults
    public ResponseEntity<?> initializeDefaultCareLevels() {
        log.info("Initializing default care levels for current user's center");

        try {
            // The service will handle getting the current user's center ID internally
            careLevelService.initializeDefaultCareLevelsForCenter(null);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Default care levels initialized successfully",
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (RuntimeException e) {
            log.error("Failed to initialize default care levels - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to initialize default care levels: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }
}
