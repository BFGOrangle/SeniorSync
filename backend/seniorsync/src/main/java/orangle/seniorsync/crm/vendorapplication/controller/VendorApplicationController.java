package orangle.seniorsync.crm.vendorapplication.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import orangle.seniorsync.crm.vendorapplication.dto.VendorApplicationRequest;
import orangle.seniorsync.crm.vendorapplication.service.VendorApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendor-applications")
@RequiredArgsConstructor
public class VendorApplicationController {

    private final VendorApplicationService service;

    @PostMapping
    public ResponseEntity<?> submit(@Valid @RequestBody VendorApplicationRequest request) {
        service.process(request);
        return ResponseEntity.ok(Map.of("message", "Application submitted successfully and emails sent", "success", true));
    }
}
