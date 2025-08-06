package orangle.seniorsync.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.common.model.Staff;
import orangle.seniorsync.common.repository.StaffRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Service responsible for staff authentication operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {
    
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Authenticate staff member with email and password
     * 
     * @param email staff email
     * @param password plain text password
     * @return authenticated staff or empty if authentication failed
     */
    public Optional<Staff> authenticate(String email, String password) {
        log.debug("Authentication attempt for email: {}", email);
        
        Optional<Staff> staffOpt = staffRepository.findByContactEmailWithCenter(email);
        
        if (staffOpt.isEmpty()) {
            log.debug("No active staff found with email: {}", email);
            return Optional.empty();
        }
        
        Staff staff = staffOpt.get();
        
        if (passwordEncoder.matches(password, staff.getPasswordHash())) {
            log.info("Successful authentication for staff: {}", staff.getFullName());
            updateLastLogin(staff.getId());
            return Optional.of(staff);
        } else {
            log.debug("Password mismatch for email: {}", email);
            return Optional.empty();
        }
    }
    
    /**
     * Change password for a staff member
     * 
     * @param staffId staff ID
     * @param newPassword new plain text password
     * @throws IllegalArgumentException if staff not found
     */
    public void changePassword(Long staffId, String newPassword) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new IllegalArgumentException("Staff not found with ID: " + staffId));
        
        staff.setPasswordHash(passwordEncoder.encode(newPassword));
        staffRepository.save(staff);
        
        log.info("Password changed for staff: {}", staff.getFullName());
    }
    
    /**
     * Generate password hash for testing purposes
     * 
     * @param password plain text password
     * @return bcrypt password hash
     */
    public String generatePasswordHash(String password) {
        return passwordEncoder.encode(password);
    }
    
    /**
     * Deactivate staff member (disable login)
     * 
     * @param staffId staff ID
     */
    public void deactivateStaff(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new IllegalArgumentException("Staff not found with ID: " + staffId));
        
        staff.setIsActive(false);
        staffRepository.save(staff);
        
        log.info("Deactivated staff: {}", staff.getFullName());
    }
    
    /**
     * Update last login timestamp
     */
    private void updateLastLogin(Long staffId) {
        staffRepository.updateLastLoginAt(staffId, OffsetDateTime.now());
    }
} 