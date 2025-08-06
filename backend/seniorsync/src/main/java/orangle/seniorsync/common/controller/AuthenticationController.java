package orangle.seniorsync.common.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.common.dto.LoginRequest;
import orangle.seniorsync.common.dto.LoginResponse;
import orangle.seniorsync.common.model.Staff;
import orangle.seniorsync.common.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

/**
 * REST controller for authentication operations
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    
    private final AuthenticationService authenticationService;
    
    /**
     * Authenticate staff member
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for email: {}", request.email());
        
        try {
            Optional<Staff> staffOpt = authenticationService.authenticate(request.email(), request.password());
            
            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();
                LoginResponse response = LoginResponse.success(
                    staff.getId(),
                    staff.getContactEmail(),
                    staff.getFirstName(),
                    staff.getLastName(),
                    staff.getJobTitle(),
                    staff.getRoleType(),
                    staff.getLastLoginAt()
                );
                
                log.info("Successful login for staff: {}", staff.getFullName());
                return ResponseEntity.ok(response);
            } else {
                log.debug("Invalid credentials for email: {}", request.email());
                return ResponseEntity.status(401).body(
                    LoginResponse.error("Invalid email or password")
                );
            }
        } catch (Exception e) {
            log.error("Login error for email: {}", request.email(), e);
            return ResponseEntity.status(500).body(
                LoginResponse.error("Internal server error")
            );
        }
    }
} 