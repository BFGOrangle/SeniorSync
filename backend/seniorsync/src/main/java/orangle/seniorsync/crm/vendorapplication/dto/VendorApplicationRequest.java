package orangle.seniorsync.crm.vendorapplication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VendorApplicationRequest {
    @NotBlank
    private String businessName;
    @NotBlank
    private String contactName;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String phone;
    @NotBlank
    private String address;
    @NotBlank
    private String serviceType;
    @NotBlank
    private String experience; // e.g., "5 years"
    @NotBlank
    @Size(max = 4000)
    private String description;
    @NotBlank
    @Size(max = 4000)
    private String availability;
}
