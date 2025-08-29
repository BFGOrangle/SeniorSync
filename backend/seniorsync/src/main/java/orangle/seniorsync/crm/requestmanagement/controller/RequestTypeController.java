package orangle.seniorsync.crm.requestmanagement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.requestmanagement.dto.CreateRequestTypeDto;
import orangle.seniorsync.crm.requestmanagement.dto.RequestTypeDto;
import orangle.seniorsync.crm.requestmanagement.service.IRequestTypeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/request-types")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
@RequiredArgsConstructor
public class RequestTypeController {

    private final IRequestTypeService requestTypeService;

    @GetMapping("/all/center/{centerId}")
    public List<RequestTypeDto> getAllRequestTypesByCenterId(@PathVariable Long centerId) {
        return requestTypeService.getAllRequestTypesByCenterId(centerId).stream()
                .map(rt -> new RequestTypeDto(rt.getId(), rt.getName(), rt.getDescription(), rt.getIsGlobal(), rt.getCenterId()))
                .toList();
    }

    @PostMapping
    public CreateRequestTypeDto createRequestTypeIfNotExist(@Validated @RequestBody CreateRequestTypeDto createRequestTypeDto) {
        return requestTypeService.createDefaultRequestTypesIfNotExist(createRequestTypeDto);
    }

    @DeleteMapping("/{id}")
    public void deleteRequestTypeById(@PathVariable Long id) {
        requestTypeService.deleteRequestTypeById(id);
    }
}
