package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.crm.requestmanagement.dto.CreateSeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.dto.SeniorRequestFilterDto;
import orangle.seniorsync.crm.requestmanagement.dto.UpdateSeniorRequestDto;
import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import orangle.seniorsync.crm.requestmanagement.projection.SeniorRequestView;

import java.util.List;

public interface IRequestManagementService {
    SeniorRequestDto createRequest(CreateSeniorRequestDto createSeniorRequestDto);
    List<SeniorRequestDto> findRequests(SeniorRequestFilterDto filter);
    List<SeniorRequestView> findRequestsByStatus(RequestStatus status);
    SeniorRequestDto updateRequest(UpdateSeniorRequestDto updateSeniorRequestDto);
    List<SeniorRequestDto> findRequestsBySenior(long id);
    void deleteRequest(long id);
}
