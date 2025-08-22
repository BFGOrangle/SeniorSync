package orangle.seniorsync.crm.staffmanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.common.service.IUserContextService;
import orangle.seniorsync.crm.staffmanagement.mapper.StaffMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import orangle.seniorsync.crm.staffmanagement.dto.CreateStaffDto;
import orangle.seniorsync.crm.staffmanagement.dto.StaffResponseDto;
import orangle.seniorsync.crm.staffmanagement.dto.UpdateStaffDto;
import orangle.seniorsync.common.model.Center;
import orangle.seniorsync.common.model.RoleType;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import orangle.seniorsync.common.util.SecurityContextUtil;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StaffManagementService implements IStaffManagementService {

    private final StaffRepository staffRepository;
    private final CognitoService cognitoService;
    private final StaffMapper staffMapper;
    private final IUserContextService userContextService;

    /**
     * Create a new staff member
     */
    public StaffResponseDto createStaff(CreateStaffDto createStaffDto) {
        log.info("Creating new staff member with email: {}", createStaffDto.contactEmail());

        String email = createStaffDto.contactEmail().trim();
        String firstName = createStaffDto.firstName().trim();
        String lastName = createStaffDto.lastName().trim();
        String phone = createStaffDto.contactPhone() != null ? createStaffDto.contactPhone().trim() : null;
        String jobTitle = createStaffDto.jobTitle() != null ? createStaffDto.jobTitle().trim() : null;

        // Check if staff with email already exists
        if (staffRepository.findByContactEmail(createStaffDto.contactEmail()).isPresent()) {
            throw new IllegalArgumentException("Staff member with email " + createStaffDto.contactEmail() + " already exists");
        }

        // Admins can only create staff for their own center
        SecurityContextUtil.requireAdmin();
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();

        String cognitoUsername = (firstName.toLowerCase() + "." + lastName.toLowerCase() + "." + currentUserCenterId)
                .replaceAll("\\s+", "_")
                .replaceAll("[^\\p{L}\\p{M}\\p{S}\\p{N}\\p{P}]", "");

        if (cognitoUsername.isBlank()) {
            throw new IllegalArgumentException("Username empty after sanitization");
        }

        UUID cognitoSub = null;

        try {
            Map<String, String> customAttributes = new HashMap<>();
            customAttributes.put("custom:center_id", currentUserCenterId.toString());
            if (phone != null && !phone.isEmpty()) {
                customAttributes.put("phone_number", phone);
            }
            customAttributes.put("given_name", firstName);
            customAttributes.put("family_name", lastName);
            customAttributes.put("name", firstName + " " + lastName);

            // Use the submitted password ONLY as a temporary password so Cognito sends invite & forces reset.
            // Consider generating a random temp password instead of using provided one.
            log.info("Attempting to create Cognito user (invite flow) for email: {}", email);
            var cognitoResponse = cognitoService.createUser(
                    cognitoUsername,
                    email,
                    createStaffDto.password(), // temporary password; user will be FORCE_CHANGE_PASSWORD
                    customAttributes
            );

            if (cognitoResponse.isEmpty()) {
                log.error("Cognito user creation returned empty response for email: {}", email);
                throw new RuntimeException("Failed to create user in Cognito - empty response. Check configuration.");
            }

            String cognitoSubString = cognitoResponse.get().user().attributes().stream()
                    .filter(attr -> "sub".equals(attr.name()))
                    .findFirst()
                    .map(AttributeType::value)
                    .orElseThrow(() -> new RuntimeException("Cognito user created but sub attribute not found"));

            cognitoSub = UUID.fromString(cognitoSubString);
            log.info("Successfully created Cognito user with sub: {} (expect FORCE_CHANGE_PASSWORD status)", cognitoSub);

            // Add user to appropriate Cognito group (using SAME username/email)
            String groupName = createStaffDto.roleType() == RoleType.ADMIN ? "ADMIN" : "STAFF";
            log.info("Adding user to Cognito group: {}", groupName);
            boolean groupAdded = cognitoService.addUserToGroup(cognitoUsername, groupName);
            if (!groupAdded) {
                log.warn("Failed to add user to Cognito group: {}", groupName);
            }

            // IMPORTANT: Do NOT set a permanent password here (keeps user in FORCE_CHANGE_PASSWORD & sends invite)

            // Create staff record in database
            Staff staff = new Staff();
            staff.setCognitoSub(cognitoSub); // Store Cognito sub
            Center center = new Center();
            center.setId(currentUserCenterId);
            staff.setCenter(center);
            staff.setFirstName(createStaffDto.firstName());
            staff.setLastName(createStaffDto.lastName());
            staff.setJobTitle(jobTitle);
            staff.setContactPhone(createStaffDto.contactPhone());
            staff.setContactEmail(email);
            staff.setRoleType(createStaffDto.roleType());
            staff.setIsActive(true);

            Staff savedStaff = staffRepository.save(staff);
            log.info("Successfully saved staff record with ID: {} (pending first login password change)", savedStaff.getId());

            return staffMapper.toResponseDto(savedStaff);

        } catch (Exception e) {
            log.error("Error creating staff member: {}", e.getMessage(), e);
            if (cognitoUsername != null) {
                log.warn("Please implement cleanup deletion for Cognito user: {} if necessary", cognitoUsername);
            }
            throw new RuntimeException("Failed to create staff member: " + e.getMessage(), e);
        }
    }

    /**
     * Get staff member by ID
     */
    @Transactional(readOnly = true)
    public Optional<StaffResponseDto> getStaffById(Long staffId) {
        log.info("Retrieving staff member with ID: {}", staffId);

        // Get current user's center ID for multi-tenancy
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();
        // Find staff and ensure they belong to the same center
        Optional<Staff> staffOpt = staffRepository.findById(staffId);
        return getStaffResponseDto(currentUserCenterId, staffOpt);
    }

    /**
     * Get staff member by CognitoSub
     */
    @Transactional(readOnly = true)
    public Optional<StaffResponseDto> getStaffByCognitoSub(UUID cognitoSub) {
        log.info("Retrieving staff member with CognitoSub: {}", cognitoSub);

        // Get current user's center ID for multi-tenancy
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();
        // Find staff and ensure they belong to the same center
        Optional<Staff> staffOpt = staffRepository.findByCognitoSub(cognitoSub);
        return getStaffResponseDto(currentUserCenterId, staffOpt);
    }

    private Optional<StaffResponseDto> getStaffResponseDto(Long currentUserCenterId, Optional<Staff> staffOpt) {
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            if (staff.getCenter() == null || !currentUserCenterId.equals(staff.getCenter().getId())) {
                throw new SecurityException("Cannot access staff from different center");
            }
            return Optional.of(staffMapper.toResponseDto(staff));
        }

        return Optional.empty();
    }

    /**
     * Get all staff members (with pagination) - Admin only, restricted to their center
     */
    @Transactional(readOnly = true)
    public Page<StaffResponseDto> getAllStaff(Pageable pageable) {
        log.info("Retrieving all staff members with pagination");

        // Only admins can view all staff, but restricted to their center
//        SecurityContextUtil.requireAdmin();
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();

        // Return staff only from admin's center
        return staffRepository.findByCenterId(currentUserCenterId, pageable)
                .map(staffMapper::toResponseDto);
    }

    /**
     * Get staff members by center ID - Must match current user's center
     */
    @Transactional(readOnly = true)
    public Page<StaffResponseDto> getStaffByCenter(Long centerId, Pageable pageable) {
        log.info("Retrieving staff members for center ID: {}", centerId);

        // Get current user's center for multi-tenancy check
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();

        // Users can only view staff from their own center
        if (!currentUserCenterId.equals(centerId)) {
            throw new SecurityException("Cannot access staff from different center");
        }

        return staffRepository.findByCenterId(centerId, pageable)
                .map(staffMapper::toResponseDto);
    }

    /**
     * Update staff member - Multi-tenancy protected
     */
    public StaffResponseDto updateStaff(Long staffId, UpdateStaffDto updateStaffDto) {
        log.info("Updating staff member with ID: {}", staffId);

        Long currentUserCenterId = userContextService.getRequestingUserCenterId();

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + staffId));

        // Ensure staff belongs to current user's center
        if (staff.getCenter() == null || !currentUserCenterId.equals(staff.getCenter().getId())) {
            throw new SecurityException("Cannot update staff from different center");
        }

        try {
            // Update staff fields if provided
            if (updateStaffDto.centerId() != null) {
                // Prevent moving staff to different center
                if (!currentUserCenterId.equals(updateStaffDto.centerId())) {
                    throw new SecurityException("Cannot move staff to different center");
                }
                Center center = new Center();
                center.setId(updateStaffDto.centerId());
                staff.setCenter(center);
            }
            if (updateStaffDto.firstName() != null) {
                staff.setFirstName(updateStaffDto.firstName());
            }
            if (updateStaffDto.lastName() != null) {
                staff.setLastName(updateStaffDto.lastName());
            }
            if (updateStaffDto.jobTitle() != null) {
                staff.setJobTitle(updateStaffDto.jobTitle());
            }
            if (updateStaffDto.contactPhone() != null) {
                staff.setContactPhone(updateStaffDto.contactPhone());
            }
            if (updateStaffDto.contactEmail() != null) {
                // Check if new email is already taken
                Optional<Staff> existingStaff = staffRepository.findByContactEmail(updateStaffDto.contactEmail());
                if (existingStaff.isPresent() && !existingStaff.get().getId().equals(staffId)) {
                    throw new IllegalArgumentException("Email already in use by another staff member");
                }
                staff.setContactEmail(updateStaffDto.contactEmail());
            }
            if (updateStaffDto.roleType() != null && updateStaffDto.roleType() != staff.getRoleType()) {
                // Good place to use optional but KIV when we have more time
                boolean groupRemoved = cognitoService.removeUserFromGroup(staff.getContactEmail(), staff.getRoleType().toString());
                if (!groupRemoved) {
                    log.warn("Failed to remove user from Cognito group: {}", staff.getRoleType().toString());
                    throw new RuntimeException("Failed to update staff role - Cognito group removal failed");
                }
                boolean groupAdded = cognitoService.addUserToGroup(staff.getContactEmail(), updateStaffDto.roleType().toString());
                if (!groupAdded) {
                    log.warn("Failed to add user to Cognito group: {}", updateStaffDto.roleType());
                    // Try to revert the removal
                    boolean isReverted = cognitoService.addUserToGroup(staff.getContactEmail(), staff.getRoleType().toString());
                    if (!isReverted) {
                        log.error("Failed to revert Cognito group addition for user: {}", staff.getContactEmail());
                    }
                    throw new RuntimeException("Failed to update staff role - Cognito group addition failed");
                }
                log.info("Updated staff role type from {} to {}", staff.getRoleType(), updateStaffDto.roleType());
                staff.setRoleType(updateStaffDto.roleType());
            }

            Staff updatedStaff = staffRepository.save(staff);

            log.info("Successfully updated staff member with ID: {}", staffId);
            return staffMapper.toResponseDto(updatedStaff);

        } catch (Exception e) {
            log.error("Error updating staff member: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update staff member: " + e.getMessage());
        }
    }

    /**
     * Delete (deactivate) staff member - Admin only, same center only
     */
    public void deleteStaff(Long staffId) {
        log.info("Deleting staff member with ID: {}", staffId);

        // Only admins can delete staff, and only from their own center
        SecurityContextUtil.requireAdmin();
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + staffId));

        // Ensure staff belongs to current user's center
        if (staff.getCenter() == null || !currentUserCenterId.equals(staff.getCenter().getId())) {
            throw new SecurityException("Cannot delete staff from different center");
        }

        try {
            // Soft delete - just deactivate
            staff.setIsActive(false);
            staffRepository.save(staff);

            log.info("Successfully deleted (deactivated) staff member with ID: {}", staffId);

        } catch (Exception e) {
            log.error("Error deleting staff member: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete staff member: " + e.getMessage());
        }
    }

    /**
     * Activate/Deactivate staff member - Admin only, same center only
     */
    public StaffResponseDto toggleStaffStatus(Long staffId, boolean isActive) {
        log.info("Toggling staff status for ID: {} to {}", staffId, isActive);

        SecurityContextUtil.requireAdmin();
        Long currentUserCenterId = userContextService.getRequestingUserCenterId();

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + staffId));

        if (staff.getCenter() == null || !currentUserCenterId.equals(staff.getCenter().getId())) {
            throw new SecurityException("Cannot modify staff from different center");
        }

        // Toggle status in Cognito
        boolean isToggleSuccess = false;
        if (!isActive) {
            log.info("Deactivating staff member in Cognito: {}", staff.getContactEmail());
            isToggleSuccess = cognitoService.disableUser(staff.getContactEmail());
        } else {
            log.info("Activating staff member in Cognito: {}", staff.getContactEmail());
            isToggleSuccess = cognitoService.enableUser(staff.getContactEmail());
        }

        if (!isToggleSuccess) {
            log.error("Failed to toggle staff status in Cognito for email: {}", staff.getContactEmail());
            throw new RuntimeException("Failed to toggle staff status in Cognito");
        }

        // Persist the status change in the database
        staff.setIsActive(isActive);
        Staff updatedStaff = staffRepository.save(staff);

        log.info("Successfully toggled staff status for ID: {}", staffId);
        return staffMapper.toResponseDto(updatedStaff);
    }

    /**
     * Get current user's staff profile using their Cognito sub
     */
    @Transactional(readOnly = true)
    public Optional<StaffResponseDto> getCurrentUserProfile() {
        log.info("Retrieving current user's staff profile");

        try {
            UUID cognitoSub = SecurityContextUtil.requireCurrentCognitoSubUUID();
            Optional<Staff> staff = staffRepository.findByCognitoSub(cognitoSub);
            
            if (staff.isPresent()) {
                return Optional.of(staffMapper.toResponseDto(staff.get()));
            } else {
                log.warn("No staff record found for current user with Cognito sub: {}", cognitoSub);
                return Optional.empty();
            }

        } catch (Exception e) {
            log.error("Error retrieving current user's staff profile: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve current user profile: " + e.getMessage());
        }
    }
}
