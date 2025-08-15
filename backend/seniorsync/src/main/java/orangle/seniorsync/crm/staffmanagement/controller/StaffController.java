package orangle.seniorsync.crm.staffmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.common.service.IUserContextService;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.service.IStaffManagementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import orangle.seniorsync.crm.staffmanagement.dto.CreateStaffDto;
import orangle.seniorsync.crm.staffmanagement.dto.StaffResponseDto;
import orangle.seniorsync.crm.staffmanagement.dto.UpdateStaffDto;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class StaffController {

    private final IStaffManagementService staffManagementService;
    private final IUserContextService userContextService;

    @Operation(summary = "Create a new staff member", description = "Creates a new staff member in both database and Cognito (Admin only)")
    @PostMapping
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateStaffDto createStaffDto) {
        log.info("Creating staff member with email: {}", createStaffDto.contactEmail());

        try {
            StaffResponseDto createdStaff = staffManagementService.createStaff(createStaffDto);
            log.info("Successfully created staff member with ID: {}", createdStaff.id());

            return ResponseEntity.status(HttpStatus.CREATED).body(createdStaff);

        } catch (SecurityException e) {
            log.warn("Access denied for staff creation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));

        } catch (IllegalArgumentException e) {
            log.warn("Failed to create staff member - validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (RuntimeException e) {
            log.error("Failed to create staff member - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to create staff member: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Get staff member by ID", description = "Retrieves a staff member by their ID (must be from same center)")
    @GetMapping("/{staffId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getStaffById(
            @Parameter(description = "Staff member ID") @PathVariable Long staffId) {

        log.info("Retrieving staff member with ID: {}", staffId);

        try {
            if (!SecurityContextUtil.isAdmin() || !userContextService.canRequestingUserAccessStaffId(staffId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Access denied - insufficient permissions",
                    "timestamp", System.currentTimeMillis()
                ));
            }

            Optional<StaffResponseDto> staff = staffManagementService.getStaffById(staffId);

            if (staff.isPresent()) {
                return ResponseEntity.ok(staff.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (SecurityException e) {
            log.warn("Access denied for staff ID {}: {}", staffId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Get staff member by cognitoSub", description = "Retrieves a staff member by their cognitoSub (must be from same center)")
    @GetMapping("/my-profile/sub/{cognitoSub}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getStaffById(
            @Parameter(description = "Staff Cognito Sub") @PathVariable String cognitoSub) {

        log.info("Retrieving staff member with cognitoSub: {}", cognitoSub);

        try {
            if (!userContextService.isRequestingUserSelf(cognitoSub)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "error", "Access denied - you can only access your own profile",
                        "timestamp", System.currentTimeMillis()
                ));
            }

            StaffResponseDto staffResponseDto = staffManagementService.getStaffByCognitoSub(cognitoSub)
                    .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

            return ResponseEntity.ok(staffResponseDto);
        } catch (SecurityException e) {
            log.warn("Access denied for staff ID {}: {}", cognitoSub, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Get all staff members", description = "Retrieves all staff members from admin's center only (Admin only)")
    @GetMapping
    public ResponseEntity<Page<StaffResponseDto>> getAllStaff(
            @PageableDefault(size = 20) Pageable pageable) {

        log.info("Retrieving all staff members for admin's center with pagination: {}", pageable);

        Page<StaffResponseDto> staffPage = staffManagementService.getAllStaff(pageable);
        return ResponseEntity.ok(staffPage);
    }

    @Operation(summary = "Get staff by center", description = "Retrieves staff members for a specific center (must match user's center)")
    @GetMapping("/center/{centerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getStaffByCenter(
            @Parameter(description = "Center ID") @PathVariable Long centerId,
            @PageableDefault(size = 20) Pageable pageable) {

        log.info("Retrieving staff members for center ID: {}", centerId);

        try {
            Page<StaffResponseDto> staffPage = staffManagementService.getStaffByCenter(centerId, pageable);
            return ResponseEntity.ok(staffPage);
        } catch (SecurityException e) {
            log.warn("Access denied for center {}: {}", centerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Update staff member", description = "Updates an existing staff member (must be from same center)")
    @PutMapping("/{staffId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> updateStaff(
            @Parameter(description = "Staff member ID") @PathVariable Long staffId,
            @Valid @RequestBody UpdateStaffDto updateStaffDto) {

        log.info("Updating staff member with ID: {}", staffId);

        try {
            if (!SecurityContextUtil.isAdmin() || !userContextService.canRequestingUserAccessStaffId(staffId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Access denied - insufficient permissions",
                    "timestamp", System.currentTimeMillis()
                ));
            }

            StaffResponseDto updatedStaff = staffManagementService.updateStaff(staffId, updateStaffDto);
            log.info("Successfully updated staff member with ID: {}", staffId);

            return ResponseEntity.ok(updatedStaff);

        } catch (SecurityException e) {
            log.warn("Access denied for staff update {}: {}", staffId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));

        } catch (IllegalArgumentException e) {
            log.warn("Failed to update staff member - validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));

        } catch (RuntimeException e) {
            log.error("Failed to update staff member - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to update staff member: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Delete staff member", description = "Soft deletes (deactivates) a staff member from admin's center only (Admin only)")
    @DeleteMapping("/{staffId}")
    public ResponseEntity<?> deleteStaff(
            @Parameter(description = "Staff member ID") @PathVariable Long staffId) {

        log.info("Deleting staff member with ID: {}", staffId);

        try {
            staffManagementService.deleteStaff(staffId);
            log.info("Successfully deleted staff member with ID: {}", staffId);

            return ResponseEntity.noContent().build();

        } catch (SecurityException e) {
            log.warn("Access denied for staff deletion {}: {}", staffId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));

        } catch (IllegalArgumentException e) {
            log.warn("Failed to delete staff member - not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();

        } catch (RuntimeException e) {
            log.error("Failed to delete staff member - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to delete staff member: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Toggle staff status", description = "Activates or deactivates a staff member from admin's center only (Admin only)")
    @PatchMapping("/{staffId}/status")
    public ResponseEntity<?> toggleStaffStatus(
            @Parameter(description = "Staff member ID") @PathVariable Long staffId,
            @Parameter(description = "Active status") @RequestParam boolean isActive) {

        log.info("Toggling status for staff member with ID: {} to {}", staffId, isActive);

        try {
            StaffResponseDto updatedStaff = staffManagementService.toggleStaffStatus(staffId, isActive);
            log.info("Successfully toggled status for staff member with ID: {}", staffId);

            return ResponseEntity.ok(updatedStaff);

        } catch (SecurityException e) {
            log.warn("Access denied for staff status toggle {}: {}", staffId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));

        } catch (IllegalArgumentException e) {
            log.warn("Failed to toggle staff status - not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();

        } catch (RuntimeException e) {
            log.error("Failed to toggle staff status - internal error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to toggle staff status: " + e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @Operation(summary = "Get current user's staff profile", description = "Retrieves the current authenticated user's staff profile")
    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getCurrentUserProfile() {
        log.info("Retrieving current user's staff profile");

        try {
            Optional<StaffResponseDto> currentUserStaff = staffManagementService.getCurrentUserProfile();
            
            if (currentUserStaff.isPresent()) {
                return ResponseEntity.ok(currentUserStaff.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (SecurityException e) {
            log.warn("Access denied for current user profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (IllegalArgumentException e) {
            log.warn("Current user not found in staff records: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
