package orangle.seniorsync.crm.seniormanagement.service;

import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.common.model.CareLevel;
import orangle.seniorsync.common.model.Center;
import orangle.seniorsync.common.service.AbstractCenterFilteredService;
import orangle.seniorsync.common.service.IUserContextService;
import orangle.seniorsync.crm.seniormanagement.dto.CareLevelDto;
import orangle.seniorsync.crm.seniormanagement.dto.CreateCareLevelDto;
import orangle.seniorsync.crm.seniormanagement.dto.UpdateCareLevelDto;
import orangle.seniorsync.crm.seniormanagement.mapper.CareLevelMapper;
import orangle.seniorsync.crm.seniormanagement.mapper.CreateCareLevelMapper;
import orangle.seniorsync.crm.seniormanagement.mapper.UpdateCareLevelMapper;
import orangle.seniorsync.crm.seniormanagement.repository.CareLevelTypesRepository;
import orangle.seniorsync.crm.seniormanagement.spec.CareLevelSpecs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
public class CareLevelService extends AbstractCenterFilteredService<CareLevel, Long> implements ICareLevelService {

    private final CareLevelTypesRepository careLevelRepository;
    private final CareLevelMapper careLevelMapper;
    private final CreateCareLevelMapper createCareLevelMapper;
    private final UpdateCareLevelMapper updateCareLevelMapper;

    public CareLevelService(
            CareLevelTypesRepository careLevelRepository,
            CareLevelMapper careLevelMapper,
            CreateCareLevelMapper createCareLevelMapper,
            UpdateCareLevelMapper updateCareLevelMapper,
            IUserContextService userContextService) {
        super(userContextService);
        this.careLevelRepository = careLevelRepository;
        this.careLevelMapper = careLevelMapper;
        this.createCareLevelMapper = createCareLevelMapper;
        this.updateCareLevelMapper = updateCareLevelMapper;
    }

    @Override
    protected JpaSpecificationExecutor<CareLevel> getRepository() {
        return careLevelRepository;
    }

    @Override
    protected Specification<CareLevel> createCenterFilterSpec(Long centerId) {
        return CareLevelSpecs.belongsToCenter(centerId);
    }

    @Override
    public CareLevelDto createCareLevel(CreateCareLevelDto createCareLevelDto) {
        log.info("Creating care level: {}", createCareLevelDto.careLevel());

        // Get current user's center
        Long centerId = userContextService.getRequestingUserCenterId();
        
        // Validate uniqueness within center
        if (careLevelRepository.existsByCareLevelAndCenterId(createCareLevelDto.careLevel().trim().toUpperCase(), centerId)) {
            throw new IllegalArgumentException("Care level '" + createCareLevelDto.careLevel() + "' already exists in this center");
        }

        // Create entity
        CareLevel careLevel = createCareLevelMapper.toEntity(createCareLevelDto);
        careLevel.setCareLevel(createCareLevelDto.careLevel().trim().toUpperCase());
        
        // Set center
        Center center = new Center();
        center.setId(centerId);
        careLevel.setCenter(center);

        // Save
        CareLevel savedCareLevel = careLevelRepository.save(careLevel);
        log.info("Created care level with ID: {}", savedCareLevel.getId());

        return careLevelMapper.toDto(savedCareLevel);
    }

    @Override
    public CareLevelDto updateCareLevel(UpdateCareLevelDto updateCareLevelDto) {
        log.info("Updating care level with ID: {}", updateCareLevelDto.id());

        Long centerId = userContextService.getRequestingUserCenterId();
        
        // Find existing care level in current center
        CareLevel existingCareLevel = careLevelRepository.findByIdAndCenterId(updateCareLevelDto.id(), centerId)
                .orElseThrow(() -> new IllegalArgumentException("Care level not found or not accessible"));

        // Validate uniqueness (excluding current ID)
        if (careLevelRepository.existsByCareLevelAndCenterIdAndIdNot(
                updateCareLevelDto.careLevel().trim().toUpperCase(), 
                centerId, 
                updateCareLevelDto.id())) {
            throw new IllegalArgumentException("Care level '" + updateCareLevelDto.careLevel() + "' already exists in this center");
        }

        // Update entity
        updateCareLevelMapper.updateExistingCareLevelFromDto(updateCareLevelDto, existingCareLevel);
        existingCareLevel.setCareLevel(updateCareLevelDto.careLevel().trim().toUpperCase());

        // Save
        CareLevel savedCareLevel = careLevelRepository.save(existingCareLevel);
        log.info("Updated care level with ID: {}", savedCareLevel.getId());

        return careLevelMapper.toDto(savedCareLevel);
    }

    @Override
    public void deleteCareLevel(Long id) {
        log.info("Deleting care level with ID: {}", id);

        Long centerId = userContextService.getRequestingUserCenterId();
        
        // Find existing care level in current center
        CareLevel careLevel = careLevelRepository.findByIdAndCenterId(id, centerId)
                .orElseThrow(() -> new IllegalArgumentException("Care level not found or not accessible"));

        // TODO: Add check if care level is in use by seniors
        // This would require injecting SeniorRepository and checking for usage
        
        careLevelRepository.delete(careLevel);
        log.info("Deleted care level with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CareLevelDto> getCareLevelById(Long id) {
        Long centerId = userContextService.getRequestingUserCenterId();
        return careLevelRepository.findByIdAndCenterId(id, centerId)
                .map(careLevelMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CareLevelDto> getAllCareLevels() {
        Long centerId = userContextService.getRequestingUserCenterId();
        return careLevelRepository.findByCenterIdOrderByCareLevel(centerId)
                .stream()
                .map(careLevelMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CareLevelDto> getCareLevelsPaginated(Pageable pageable) {
        Page<CareLevel> careLevelsPage = findAllWithCenterFilter(null, pageable);
        return careLevelsPage.map(careLevelMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean careLevelExists(String careLevel) {
        Long centerId = userContextService.getRequestingUserCenterId();
        return careLevelRepository.existsByCareLevelAndCenterId(careLevel.trim().toUpperCase(), centerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean careLevelExistsExcluding(String careLevel, Long excludeId) {
        Long centerId = userContextService.getRequestingUserCenterId();
        return careLevelRepository.existsByCareLevelAndCenterIdAndIdNot(
                careLevel.trim().toUpperCase(), 
                centerId, 
                excludeId);
    }

    @Override
    public void initializeDefaultCareLevelsForCenter(Long centerId) {
        // Use current user's center if centerId is null
        Long targetCenterId = centerId != null ? centerId : userContextService.getRequestingUserCenterId();
        log.info("Initializing default care levels for center: {}", targetCenterId);

        // Check if center already has care levels
        if (!careLevelRepository.findByCenterIdOrderByCareLevel(targetCenterId).isEmpty()) {
            log.info("Center {} already has care levels, skipping initialization", targetCenterId);
            return;
        }

        // Default care levels matching frontend constants
        String[][] defaultCareLevels = {
                {"LOW", "#22c55e"},
                {"MEDIUM", "#eab308"},
                {"HIGH", "#f97316"},
                {"CRITICAL", "#ef4444"},
                {"INDEPENDENT", "#3b82f6"},
                {"SUPERVISED", "#6f42c1"}
        };

        Center center = new Center();
        center.setId(targetCenterId);

        for (String[] levelData : defaultCareLevels) {
            CareLevel careLevel = new CareLevel();
            careLevel.setCenter(center);
            careLevel.setCareLevel(levelData[0]);
            careLevel.setCareLevelColor(levelData[1]);
            careLevelRepository.save(careLevel);
        }

        log.info("Initialized {} default care levels for center: {}", defaultCareLevels.length, targetCenterId);
    }
}
