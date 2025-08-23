package orangle.seniorsync.crm.aifeatures.controller;

import orangle.seniorsync.crm.aifeatures.service.ISanitiseRequestDetailsService;
import orangle.seniorsync.crm.aifeatures.service.SanitiseRequestDetailsService;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/aifeatures/sanitise")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class SanitiseRequestDetailsController {
    private final ISanitiseRequestDetailsService sanitiseRequestDetailsService;

    public SanitiseRequestDetailsController(SanitiseRequestDetailsService sanitiseRequestDetailsService) {
        this.sanitiseRequestDetailsService = sanitiseRequestDetailsService;
    }

    @PostMapping("/sanitiseDetails")
    public ResponseEntity<String> sanitiseRequestDetails(@RequestBody SeniorRequestDto seniorRequestDto) {
        String sanitizedText = sanitiseRequestDetailsService.sanitise(seniorRequestDto.description());
        System.out.println("Sanitized request description for request ID: " + seniorRequestDto.id());
        return ResponseEntity.ok(sanitizedText);
    }
}