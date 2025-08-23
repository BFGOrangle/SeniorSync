package orangle.seniorsync.crm.seniormanagement.service;

import orangle.seniorsync.crm.seniormanagement.dto.CareLevelDto;
import orangle.seniorsync.crm.seniormanagement.dto.CreateCareLevelDto;
import orangle.seniorsync.crm.seniormanagement.dto.UpdateCareLevelDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for care level management operations
 */
public interface ICareLevelService {

    /**
     * Create a new care level
     * @param createCareLevelDto the care level data
     * @return the created care level
     * @throws IllegalArgumentException if care level name already exists in center
     */
    CareLevelDto createCareLevel(CreateCareLevelDto createCareLevelDto);

    /**
     * Update an existing care level
     * @param updateCareLevelDto the updated care level data
     * @return the updated care level
     * @throws IllegalArgumentException if care level not found or name conflicts
     */
    CareLevelDto updateCareLevel(UpdateCareLevelDto updateCareLevelDto);

    /**
     * Delete a care level by ID
     * @param id the care level ID
     * @throws IllegalArgumentException if care level not found
     * @throws IllegalStateException if care level is in use by seniors
     */
    void deleteCareLevel(Long id);

    /**
     * Get care level by ID (scoped to current user's center)
     * @param id the care level ID
     * @return the care level if found
     */
    Optional<CareLevelDto> getCareLevelById(Long id);

    /**
     * Get all care levels for current user's center
     * @return list of care levels
     */
    List<CareLevelDto> getAllCareLevels();

    /**
     * Get paginated care levels for current user's center
     * @param pageable pagination parameters
     * @return page of care levels
     */
    Page<CareLevelDto> getCareLevelsPaginated(Pageable pageable);

    /**
     * Check if care level name exists in current user's center
     * @param careLevel the care level name
     * @return true if exists
     */
    boolean careLevelExists(String careLevel);

    /**
     * Check if care level name exists in current user's center, excluding a specific ID
     * @param careLevel the care level name
     * @param excludeId the ID to exclude from check
     * @return true if exists
     */
    boolean careLevelExistsExcluding(String careLevel, Long excludeId);

    /**
     * Initialize default care levels for a center if none exist
     * @param centerId the center ID
     */
    void initializeDefaultCareLevelsForCenter(Long centerId);
}

