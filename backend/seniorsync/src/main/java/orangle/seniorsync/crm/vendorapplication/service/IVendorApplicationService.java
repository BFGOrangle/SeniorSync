package orangle.seniorsync.crm.vendorapplication.service;

import orangle.seniorsync.crm.vendorapplication.dto.VendorApplicationRequest;

public interface IVendorApplicationService {
    public void process(VendorApplicationRequest req);
}
