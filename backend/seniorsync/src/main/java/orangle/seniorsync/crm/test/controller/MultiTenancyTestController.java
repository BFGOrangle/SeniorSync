package orangle.seniorsync.crm.test.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import orangle.seniorsync.common.model.Senior;
import orangle.seniorsync.common.model.Staff;
import orangle.seniorsync.common.repository.StaffRepository;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.seniormanagement.repository.SeniorRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Test controller to verify multi-tenancy filtering is working correctly.
 * This controller should only be enabled in development/test profiles.
 */
@Slf4j
@RestController
@RequestMapping("/api/test/multi-tenancy")
@RequiredArgsConstructor
@Profile({"dev", "test"})
public class MultiTenancyTestController {

    private final StaffRepository staffRepository;
    private final SeniorRepository seniorRepository;

    @GetMapping("/verify")
    public Map<String, Object> verifyMultiTenancy() {
        Map<String, Object> result = new HashMap<>();
        
        // Get current user info
        Long currentUserId = SecurityContextUtil.getCurrentUserId().orElse(null);
        Long currentCenterId = SecurityContextUtil.getCurrentCenterId().orElse(null);
        
        result.put("currentUserId", currentUserId);
        result.put("currentCenterId", currentCenterId);
        
        // Fetch all staff (should be filtered by center_id)
        List<Staff> staffList = staffRepository.findAll();
        result.put("staffCount", staffList.size());
        result.put("staffCenterIds", staffList.stream()
                .map(s -> s.getCenter() != null ? s.getCenter().getId() : null)
                .distinct()
                .toList());
        
        // Fetch all seniors (should be filtered by center_id)
        List<Senior> seniorList = seniorRepository.findAll();
        result.put("seniorCount", seniorList.size());
        result.put("seniorCenterIds", seniorList.stream()
                .map(s -> s.getCenter() != null ? s.getCenter().getId() : null)
                .distinct()
                .toList());
        
        // Log the results
        log.info("Multi-tenancy verification: {}", result);
        
        return result;
    }
}
