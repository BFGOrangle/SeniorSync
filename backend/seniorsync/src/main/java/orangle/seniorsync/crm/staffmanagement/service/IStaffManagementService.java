package orangle.seniorsync.crm.staffmanagement.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import orangle.seniorsync.crm.staffmanagement.dto.CreateStaffDto;
import orangle.seniorsync.crm.staffmanagement.dto.StaffResponseDto;
import orangle.seniorsync.crm.staffmanagement.dto.UpdateStaffDto;

import java.util.Optional;

public interface IStaffManagementService {
    StaffResponseDto createStaff(CreateStaffDto createStaffDto);
    Optional<StaffResponseDto> getStaffById(Long staffId);
    Page<StaffResponseDto> getAllStaff(Pageable pageable);
    Optional<StaffResponseDto> getStaffByCognitoSub(String cognitoSub);
    Page<StaffResponseDto> getStaffByCenter(Long centerId, Pageable pageable);
    StaffResponseDto updateStaff(Long staffId, UpdateStaffDto updateStaffDto);
    void deleteStaff(Long staffId);
    StaffResponseDto toggleStaffStatus(Long staffId, boolean isActive);
    Optional<StaffResponseDto> getCurrentUserProfile();
}
