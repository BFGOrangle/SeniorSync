package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.crm.requestmanagement.dto.*;
import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import orangle.seniorsync.crm.requestmanagement.projection.SeniorRequestView;

import java.util.List;

public interface IRequestManagementService {
    SeniorRequestDto createRequest(CreateSeniorRequestDto createSeniorRequestDto);
    List<SeniorRequestDto> findRequests(SeniorRequestFilterDto filter);
    SeniorRequestDto findRequestById(long id);
    List<SeniorRequestView> findRequestsByStatus(RequestStatus status);
    SeniorRequestDto updateRequest(UpdateSeniorRequestDto updateSeniorRequestDto);
    List<SeniorRequestDto> findRequestsBySenior(long id);
    void deleteRequest(long id);
    DashboardDto getDashboard();
    
    // Assignment operations with role-based business rules
    SeniorRequestDto assignRequest(Long requestId, AssignRequestDto assignRequestDto);
    SeniorRequestDto unassignRequest(Long requestId);
    
    // New filter support methods
    RequestFilterOptionsDto getFilterOptions();
    List<SeniorRequestDto> findMyRequests(SeniorRequestFilterDto filter);
}
