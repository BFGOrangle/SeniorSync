package orangle.seniorsync.crm.seniormanagement.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.seniormanagement.dto.CreateSeniorDto;
import orangle.seniorsync.crm.seniormanagement.dto.SeniorDto;
import orangle.seniorsync.crm.seniormanagement.dto.SeniorFilterDto;
import orangle.seniorsync.crm.seniormanagement.dto.UpdateSeniorDto;
import orangle.seniorsync.crm.seniormanagement.service.ISeniorManagementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/seniors")
public class SeniorManagementController {

    private final ISeniorManagementService seniorManagementService;

    public SeniorManagementController(ISeniorManagementService seniorManagementService) {
        this.seniorManagementService = seniorManagementService;
    }

    @PostMapping
    public ResponseEntity<SeniorDto> createSenior(@Valid @RequestBody CreateSeniorDto createSeniorDto) {
        SeniorDto createdSenior = seniorManagementService.createSenior(createSeniorDto);
        log.info("Created new senior with ID: {}", createdSenior.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSenior);
    }

    /**
     * Get paginated seniors with filtering
     * This endpoint ALWAYS uses pagination and never fetches all records.
     */
    @PostMapping("/paginated")
    public ResponseEntity<Page<SeniorDto>> getSeniorsPaginated(
            @RequestBody(required = false) SeniorFilterDto filter,
            @PageableDefault(sort = {"lastName", "firstName"}) Pageable pageable) {

        // Enforce maximum page size to prevent abuse
        if (pageable.getPageSize() > 100) {
            pageable = PageRequest.of(pageable.getPageNumber(), 100, pageable.getSort());
        }

        Page<SeniorDto> seniorsPage = seniorManagementService.findSeniorsPaginated(filter, pageable);
        log.info("Retrieved page {} of seniors (size: {}, total: {})",
                pageable.getPageNumber(), seniorsPage.getNumberOfElements(), seniorsPage.getTotalElements());

        return ResponseEntity.ok(seniorsPage);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<SeniorDto>> searchSeniorsByName(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @PageableDefault(size = 10, sort = {"lastName", "firstName"}) Pageable pageable) {

        if ((firstName == null || firstName.trim().isEmpty()) &&
                (lastName == null || lastName.trim().isEmpty())) {
            return ResponseEntity.badRequest().build();
        }

        // Enforce smaller page size for search results
        if (pageable.getPageSize() > 50) {
            pageable = PageRequest.of(pageable.getPageNumber(), 50, pageable.getSort());
        }

        Page<SeniorDto> searchResults = seniorManagementService.searchSeniorsByNamePaginated(
                firstName, lastName, pageable);

        log.info("Search found {} seniors matching criteria on page {}",
                searchResults.getNumberOfElements(), pageable.getPageNumber());

        return ResponseEntity.ok(searchResults);
    }

    /**
     * Get count of seniors matching filter (for dashboard metrics)
     */
    @PostMapping("/count")
    public ResponseEntity<Long> getSeniorsCount(@RequestBody(required = false) SeniorFilterDto filter) {
        long count = seniorManagementService.countSeniors(filter);
        return ResponseEntity.ok(count);
    }

    @Deprecated
    @GetMapping
    public ResponseEntity<List<SeniorDto>> getSeniors(@RequestBody(required = false) SeniorFilterDto filter) {
        log.warn("Legacy /seniors endpoint called. Consider migrating to /seniors/paginated");

        // Delegate to paginated version with reasonable defaults
        Page<SeniorDto> page = seniorManagementService.findSeniorsPaginated(filter,
                PageRequest.of(0, 50, Sort.by("lastName", "firstName")));

        return ResponseEntity.ok(page.getContent());
    }

    @PutMapping
    public ResponseEntity<SeniorDto> updateSenior(@Valid @RequestBody UpdateSeniorDto updateSeniorDto) {
        SeniorDto updatedSenior = seniorManagementService.updateSenior(updateSeniorDto);
        log.info("Updated senior with ID: {}", updatedSenior.id());
        return ResponseEntity.ok(updatedSenior);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSenior(@PathVariable long id) {
        seniorManagementService.deleteSenior(id);
        log.info("Deleted senior with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}