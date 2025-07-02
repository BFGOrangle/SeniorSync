package orangle.seniorsync.crm.requestmanagement.service;

import orangle.seniorsync.crm.requestmanagement.dto.CreateReminderDto;
import orangle.seniorsync.crm.requestmanagement.dto.ReminderDto;
import orangle.seniorsync.crm.requestmanagement.dto.UpdateReminderDto;
import orangle.seniorsync.crm.requestmanagement.mapper.CreateReminderMapper;
import orangle.seniorsync.crm.requestmanagement.mapper.ReminderMapper;
import orangle.seniorsync.crm.requestmanagement.mapper.UpdateReminderMapper;
import orangle.seniorsync.crm.requestmanagement.model.Reminder;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import orangle.seniorsync.crm.requestmanagement.repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReminderService implements IReminderService {

    private final ReminderRepository reminderRepository;
    private final ReminderMapper reminderMapper;
    private final CreateReminderMapper createReminderMapper;
    private final UpdateReminderMapper updateReminderMapper;

    public ReminderService(ReminderRepository reminderRepository, ReminderMapper reminderMapper, CreateReminderMapper createReminderMapper, UpdateReminderMapper updateReminderMapper) {
        this.reminderRepository = reminderRepository;
        this.reminderMapper = reminderMapper;
        this.createReminderMapper = createReminderMapper;
        this.updateReminderMapper = updateReminderMapper;
    }

    @Override
    public List<ReminderDto> findReminders(Long requestId) {
        List<Reminder> reminders;
        if (requestId == null) {
            reminders = reminderRepository.findAll();
        } else {
            reminders = reminderRepository.findByRequestId(requestId);
        }
        return reminders.stream()
                .map(reminderMapper::toDto)
                .toList();
    }

    /**
     * Creates a new reminder based on the provided DTO.
     * Maps the DTO to an entity, saves it to the repository, and returns the created request as a DTO.
     *
     * @param createReminderDto the DTO containing the details of the reminder to be created
     * @return the created ReminderDto
     */
    @Override
    public ReminderDto createReminder(CreateReminderDto createReminderDto) {
        Reminder reminderToCreate = createReminderMapper.toEntity(createReminderDto);
        Reminder createdReminder = reminderRepository.save(reminderToCreate);
        return reminderMapper.toDto(createdReminder);
    }

    @Override
    public ReminderDto updateReminder(UpdateReminderDto updateReminderDto) {
        Reminder reminderToUpdate = reminderRepository.findById(updateReminderDto.id())
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found with id: " + updateReminderDto.id()));

        updateReminderMapper.updateExistingReminderFromDto(updateReminderDto, reminderToUpdate);

        Reminder updatedReminder = reminderRepository.save(reminderToUpdate);
        return reminderMapper.toDto(updatedReminder);
    }

    public void deleteReminder(long id) {
        Reminder existingReminder = reminderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));
        reminderRepository.delete(existingReminder);
    }
}
