package orangle.seniorsync.crm.seniormanagement.service;

import orangle.seniorsync.crm.seniormanagement.dto.CreateSeniorDto;
import orangle.seniorsync.crm.seniormanagement.dto.SeniorDto;
import orangle.seniorsync.crm.seniormanagement.dto.SeniorFilterDto;

import orangle.seniorsync.crm.seniormanagement.dto.UpdateSeniorDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ISeniorManagementService {
    SeniorDto createSenior(CreateSeniorDto createSeniorDto);
    Page<SeniorDto> findSeniorsPaginated(SeniorFilterDto filter, Pageable pageable);
    Page<SeniorDto> searchSeniorsByNamePaginated(String firstName, String lastName, Pageable pageable);
    long countSeniors(SeniorFilterDto filter);
    SeniorDto updateSenior(UpdateSeniorDto updateSeniorDto);
    void deleteSenior(long id);
    @Deprecated
    List<SeniorDto> findSeniors(SeniorFilterDto filter);
}