package orangle.seniorsync.common.service;

import orangle.seniorsync.crm.staffmanagement.model.Staff;

import java.util.UUID;

public interface IUserContextService {

    Staff getRequestingUser();

    Long getRequestingUserCenterId();

    boolean isRequestingUserSelfCheckByStaffId(Long StaffId);

    /**
     * IMPT: This overload users cognito sub not staff ID
     */
    boolean isRequestingUserSelfCheckBySub(UUID cognitoSub);

    boolean canRequestingUserAccessStaffId(Long staffId);
}
