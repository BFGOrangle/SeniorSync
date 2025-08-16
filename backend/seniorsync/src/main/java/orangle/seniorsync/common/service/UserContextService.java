package orangle.seniorsync.common.service;

import lombok.RequiredArgsConstructor;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.staffmanagement.model.Staff;
import orangle.seniorsync.crm.staffmanagement.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserContextService implements IUserContextService {

    private final StaffRepository staffRepository;

    public Staff getRequestingUser() {
        UUID cognitoSub = SecurityContextUtil.getCurrentCognitoSubUUID()
                .orElseThrow(() -> new RuntimeException("Requesting User Cognito sub not available"));
        return staffRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
    }

    public Long getRequestingUserCenterId() {
        Staff requestingUser = getRequestingUser();
        return requestingUser.getCenter().getId();
    }

    public boolean isRequestingUserSelfCheckByStaffId(Long requestedStaffId) {
        UUID cognitoSub = SecurityContextUtil.getCurrentCognitoSubUUID()
                .orElseThrow(() -> new RuntimeException("Requesting User Cognito sub not available"));
        Staff staff = staffRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new RuntimeException("Requesting User not found"));
        return staff.getId().equals(requestedStaffId);
    }

    public boolean isRequestingUserSelfCheckBySub(UUID cognitoSub) {
        Staff staff = staffRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new RuntimeException("Requesting User not found"));
        UUID currentCognitoSub = SecurityContextUtil.getCurrentCognitoSubUUID()
                .orElseThrow(() -> new RuntimeException("Requesting User Cognito sub not available"));
        return staff.getCognitoSub().equals(currentCognitoSub);
    }

    public boolean canRequestingUserAccessStaffId(Long requestedStaffId) {
        if (SecurityContextUtil.isAdmin()) {
            Long requesterCenterId = getRequestingUserCenterId();
            Staff requestedStaff = staffRepository.findById(requestedStaffId)
                    .orElseThrow(() -> new RuntimeException("Requested Staff not found"));
            Long requestedStaffCenterId = requestedStaff.getCenter().getId();
            return requesterCenterId.equals(requestedStaffCenterId);
        }
        return isRequestingUserSelfCheckByStaffId(requestedStaffId);
    }
}
