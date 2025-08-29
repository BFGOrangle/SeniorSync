package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.crm.requestmanagement.dto.CreateRequestTypeDto;
import orangle.seniorsync.crm.requestmanagement.model.RequestType;

import java.util.List;

public interface IRequestTypeService {
    List<RequestType> getAllRequestTypesByCenterId(Long centerId);
    CreateRequestTypeDto createDefaultRequestTypesIfNotExist(CreateRequestTypeDto requestTypeDto);
    void deleteRequestTypeById(Long id);
}