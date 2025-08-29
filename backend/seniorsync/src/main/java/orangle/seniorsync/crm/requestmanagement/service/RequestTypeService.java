package orangle.seniorsync.crm.requestmanagement.service;

import lombok.RequiredArgsConstructor;
import orangle.seniorsync.crm.requestmanagement.dto.CreateRequestTypeDto;
import orangle.seniorsync.crm.requestmanagement.model.RequestType;
import orangle.seniorsync.crm.requestmanagement.repository.RequestTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestTypeService implements IRequestTypeService {

    private final RequestTypeRepository requestTypeRepository;

    @Override
    public List<RequestType> getAllRequestTypesByCenterId(Long centerId) {
        return requestTypeRepository.findAll().stream()
                .filter(rt -> centerId.equals(rt.getCenterId()) || rt.getIsGlobal())
                .toList();
    }

    @Override
    public CreateRequestTypeDto createDefaultRequestTypesIfNotExist(CreateRequestTypeDto requestTypeDto) {
        boolean exists = requestTypeRepository.findAll().stream()
                .anyMatch(rt -> rt.getName().equals(requestTypeDto.name()) && rt.getCenterId().equals(requestTypeDto.centerId()));
        if (!exists) {
            var requestType = new orangle.seniorsync.crm.requestmanagement.model.RequestType();
            requestType.setName(requestTypeDto.name());
            requestType.setDescription(requestTypeDto.description());
            requestType.setCenterId(requestTypeDto.centerId());
            requestTypeRepository.save(requestType);
        } else {
            throw new RuntimeException("Request type already exists");
        }
        return requestTypeDto;
    }

    @Override
    public void deleteRequestTypeById(Long id) {
        requestTypeRepository.deleteById(id);
    }
}
