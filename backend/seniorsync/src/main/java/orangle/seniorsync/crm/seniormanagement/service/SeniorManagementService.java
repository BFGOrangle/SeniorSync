package orangle.seniorsync.crm.seniormanagement.service;

import orangle.seniorsync.common.model.Center;
import orangle.seniorsync.common.model.Senior;
import orangle.seniorsync.common.service.AbstractCenterFilteredService;
import orangle.seniorsync.common.util.SecurityContextUtil;
import orangle.seniorsync.crm.seniormanagement.mapper.CreateSeniorMapper;
import orangle.seniorsync.crm.seniormanagement.dto.CreateSeniorDto;
import orangle.seniorsync.crm.seniormanagement.dto.SeniorDto;
import orangle.seniorsync.crm.seniormanagement.dto.SeniorFilterDto;
import orangle.seniorsync.crm.seniormanagement.dto.UpdateSeniorDto;
import orangle.seniorsync.crm.seniormanagement.mapper.SeniorMapper;
import orangle.seniorsync.crm.seniormanagement.mapper.UpdateSeniorMapper;
import orangle.seniorsync.crm.seniormanagement.repository.SeniorRepository;
import orangle.seniorsync.crm.seniormanagement.spec.SeniorSpecs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeniorManagementService extends AbstractCenterFilteredService<Senior, Long> implements ISeniorManagementService {

    private final SeniorRepository seniorRepository;
    private final CreateSeniorMapper createSeniorMapper;
    private final SeniorMapper seniorMapper;
    private final UpdateSeniorMapper updateSeniorMapper;

    public SeniorManagementService(
            SeniorRepository seniorRepository,
            CreateSeniorMapper createSeniorMapper,
            SeniorMapper seniorMapper,
            UpdateSeniorMapper updateSeniorMapper) {
        this.seniorRepository = seniorRepository;
        this.createSeniorMapper = createSeniorMapper;
        this.seniorMapper = seniorMapper;
        this.updateSeniorMapper = updateSeniorMapper;
    }

    /**
     * Get the repository for the abstract base service
     */
    @Override
    protected JpaSpecificationExecutor<Senior> getRepository() {
        return seniorRepository;
    }

    /**
     * Create center filter specification for seniors
     */
    @Override
    protected Specification<Senior> createCenterFilterSpec(Long centerId) {
        return SeniorSpecs.belongsToCenter(centerId);
    }

    /**
     * Creates a new senior based on the provided DTO.
     * Maps the DTO to an entity, saves it to the repository, and returns the created senior as a DTO.
     *
     * @param createSeniorDto the DTO containing the details of the senior to be created
     * @return the created SeniorDto
     */
    @Override
    public SeniorDto createSenior(CreateSeniorDto createSeniorDto) {
        Senior seniorToCreate = createSeniorMapper.toEntity(createSeniorDto);
        
        // Automatically set center from current user
        Long currentCenterId = SecurityContextUtil.requireCurrentUserCenterId();
        Center center = new Center();
        center.setId(currentCenterId);
        seniorToCreate.setCenter(center);
        
        Senior createdSenior = seniorRepository.save(seniorToCreate);
        return seniorMapper.toDto(createdSenior);
    }

    /**
     * Get paginated seniors with filtering - PROPER PAGINATION IMPLEMENTATION
     * @param filter the filter criteria
     * @param pageable pagination parameters
     * @return Page<SeniorDto> paginated results
     */
    @Override
    public Page<SeniorDto> findSeniorsPaginated(SeniorFilterDto filter, Pageable pageable) {
        Specification<Senior> userSpec = null;
        
        // Build user specification only if filter is provided and not empty
        if (filter != null && !isEmptyFilter(filter)) {
            userSpec = Specification.allOf(
                    SeniorSpecs.hasFirstNameLike(filter.firstName()),
                    SeniorSpecs.hasLastNameLike(filter.lastName()),
                    SeniorSpecs.hasContactPhoneLike(filter.contactPhone()),
                    SeniorSpecs.hasContactEmailLike(filter.contactEmail()),
                    SeniorSpecs.dateOfBirthBetween(filter.minDateOfBirth(), filter.maxDateOfBirth()),
                    SeniorSpecs.hasCareLevel(filter.careLevel()),           
                    SeniorSpecs.hasCareLevelColor(filter.careLevelColor()), 
                    SeniorSpecs.hasCharacteristics(filter.characteristics()) 
            );
        }
        
        // Use abstracted method that automatically applies center filtering
        Page<Senior> seniorsPage = findAllWithCenterFilter(userSpec, pageable);

        return seniorsPage.map(seniorMapper::toDto);
    }

    /**
     * Search seniors by name with pagination - HIGH PERFORMANCE
     * @param firstName optional first name
     * @param lastName optional last name
     * @param pageable pagination parameters
     * @return Page<SeniorView> paginated projections
     */
    @Override
    public Page<SeniorDto> searchSeniorsByNamePaginated(String firstName, String lastName, Pageable pageable) {
        if ((firstName == null || firstName.trim().isEmpty()) &&
                (lastName == null || lastName.trim().isEmpty())) {
            return Page.empty(pageable);
        }

        // Build name search specification
        var nameSpec = Specification.allOf(
                SeniorSpecs.hasFirstNameLike(firstName),
                SeniorSpecs.hasLastNameLike(lastName)
        );

        // Use abstracted method that automatically applies center filtering
        Page<Senior> seniorsPage = findAllWithCenterFilter(nameSpec, pageable);

        // Map the Senior entities to SeniorDto
        return seniorsPage.map(seniorMapper::toDto);
    }

    /**
     * Count seniors matching filter criteria
     * @param filter the filter criteria
     * @return count of matching seniors
     */
    @Override
    public long countSeniors(SeniorFilterDto filter) {
        Specification<Senior> userSpec = null;
        
        // Build user specification if filter is provided and not empty
        if (filter != null && !isEmptyFilter(filter)) {
            userSpec = Specification.allOf(
                    SeniorSpecs.hasFirstNameLike(filter.firstName()),
                    SeniorSpecs.hasLastNameLike(filter.lastName()),
                    SeniorSpecs.hasContactPhoneLike(filter.contactPhone()),
                    SeniorSpecs.hasContactEmailLike(filter.contactEmail()),
                    SeniorSpecs.dateOfBirthBetween(filter.minDateOfBirth(), filter.maxDateOfBirth()),
                    SeniorSpecs.hasCareLevel(filter.careLevel()),
                    SeniorSpecs.hasCareLevelColor(filter.careLevelColor()),
                    SeniorSpecs.hasCharacteristics(filter.characteristics())
            );
        }

        // Use abstracted method that automatically applies center filtering
        return countWithCenterFilter(userSpec);
    }

    /**
     * Check if filter is empty
     */
    private boolean isEmptyFilter(SeniorFilterDto filter) {
        return (filter.firstName() == null || filter.firstName().trim().isEmpty()) &&
                (filter.lastName() == null || filter.lastName().trim().isEmpty()) &&
                (filter.contactPhone() == null || filter.contactPhone().trim().isEmpty()) &&
                (filter.contactEmail() == null || filter.contactEmail().trim().isEmpty()) &&
                filter.minDateOfBirth() == null &&
                filter.maxDateOfBirth() == null &&
                (filter.careLevel() == null || filter.careLevel().trim().isEmpty()) &&
                (filter.careLevelColor() == null || filter.careLevelColor().trim().isEmpty()) &&
                (filter.characteristics() == null || filter.characteristics().length == 0);
    }

    /**
     * Finds all seniors based on the provided filter criteria.
     * Uses JPA Specifications to build a dynamic query based on the filter parameters.
     *
     * <p>This should not be used for high-QPS, read-only endpoints because:
     * <ul>
     *   <li><strong>Entity hydration & persistence‐context overhead:</strong> Hibernate must fetch every column and instantiate full JPA entities, register them in the persistence context, and track their state. This is the single largest drag on throughput.</li>
     *   <li>Additional mapping step: We then map each entity to a DTO in Java—incurring extra CPU and memory overhead.</li>
     *   <li>Unnecessary columns: Timestamps and other fields you don't need still get fetched from the database.</li>
     * </ul>
     * For ultra-high-throughput read paths, prefer interface or constructor projections so that:
     * <ul>
     *   <li>Only the selected columns are fetched.</li>
     *   <li>No full entity instantiation or change-tracking occurs.</li>
     *   <li>No extra Java-level mapping step is required.</li>
     * </ul>
     *
     * @param filter the filter criteria for searching seniors
     * @return a list of SeniorDto matching the filter criteria
     */
    @Override
    public List<SeniorDto> findSeniors(SeniorFilterDto filter) {
        Specification<Senior> userSpec = null;
        
        // Build user specification if filter is provided
        if (filter != null) {
            userSpec = Specification.allOf(
                    SeniorSpecs.hasFirstNameLike(filter.firstName()),
                    SeniorSpecs.hasLastNameLike(filter.lastName()),
                    SeniorSpecs.hasContactPhoneLike(filter.contactPhone()),
                    SeniorSpecs.hasContactEmailLike(filter.contactEmail()),
                    SeniorSpecs.dateOfBirthBetween(filter.minDateOfBirth(), filter.maxDateOfBirth())
            );
        }

        // Use abstracted method that automatically applies center filtering
        List<Senior> seniorsQueryResult = findAllWithCenterFilter(userSpec);

        return seniorsQueryResult.stream()
                .map(seniorMapper::toDto)
                .toList();
    }

    /**
     * Updates a senior based on the provided DTO.
     * If the senior does not exist or doesn't belong to the current user's center, an IllegalArgumentException is thrown.
     *
     * @param updateSeniorDto the DTO containing the updated details of the senior
     * @return the updated SeniorDto
     * @throws IllegalArgumentException if the senior with the specified ID is not found in the current user's center
     */
    @Override
    public SeniorDto updateSenior(UpdateSeniorDto updateSeniorDto) {
        // Create specification for ID and center filtering
        var spec = (Specification<Senior>) (root, query, cb) -> cb.equal(root.get("id"), updateSeniorDto.id());
        
        // Use abstracted method that automatically applies center filtering
        List<Senior> seniors = findAllWithCenterFilter(spec);
        
        if (seniors.isEmpty()) {
            throw new IllegalArgumentException("Senior not found with ID: " + updateSeniorDto.id() + " in your center");
        }
        
        Senior existingSenior = seniors.get(0);
        
        // Update existing senior object with the new values from the DTO in place
        updateSeniorMapper.updateExistingSeniorFromDto(updateSeniorDto, existingSenior);
        seniorRepository.save(existingSenior);
        
        return seniorMapper.toDto(existingSenior);
    }

    /**
     * Deletes a senior by its ID.
     * If the senior does not exist or doesn't belong to the current user's center, an IllegalArgumentException is thrown.
     *
     * @param id the ID of the senior to delete
     * @throws IllegalArgumentException if the senior with the specified ID is not found in the current user's center
     */
    @Override
    public void deleteSenior(long id) {
        // Create specification for ID and center filtering
        var spec = (Specification<Senior>) (root, query, cb) -> cb.equal(root.get("id"), id);
        
        // Use abstracted method that automatically applies center filtering
        List<Senior> seniors = findAllWithCenterFilter(spec);
        
        if (seniors.isEmpty()) {
            throw new IllegalArgumentException("Senior not found with ID: " + id + " in your center");
        }
        
        Senior existingSenior = seniors.get(0);
        seniorRepository.delete(existingSenior);
    }

    /**
     * Find a single senior by its ID.
     * If the senior does not exist or doesn't belong to the current user's center, an IllegalArgumentException is thrown.
     *
     * @param id the ID of the senior to find
     * @return the SeniorDto
     * @throws IllegalArgumentException if the senior with the specified ID is not found in the current user's center
     */
    @Override
    public SeniorDto findSeniorById(long id) {
        // Create specification for ID and center filtering
        var spec = (Specification<Senior>) (root, query, cb) -> cb.equal(root.get("id"), id);
        
        // Use abstracted method that automatically applies center filtering
        List<Senior> seniors = findAllWithCenterFilter(spec);
        
        if (seniors.isEmpty()) {
            throw new IllegalArgumentException("Senior not found with ID: " + id + " in your center");
        }
        
        return seniorMapper.toDto(seniors.get(0));
    }
}