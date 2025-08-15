package orangle.seniorsync.common.service;

import orangle.seniorsync.crm.staffmanagement.model.Staff;

public interface IUserContextService {

    Staff getRequestingUser();

    Long getRequestingUserCenterId();

    boolean isRequestingUserSelf(Long StaffId);

    /**
     * IMPT: This overload users cognito sub not staff ID
     * @param cognitoSub
     * @return
     */
    boolean isRequestingUserSelf(String cognitoSub);

    boolean canRequestingUserAccessStaffId(Long staffId);
}
