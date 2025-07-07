package orangle.seniorsync.crm.reminder.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.reminder.dto.CreateReminderDto;
import orangle.seniorsync.crm.reminder.dto.ReminderDto;
import orangle.seniorsync.crm.reminder.dto.UpdateReminderDto;
import orangle.seniorsync.crm.reminder.service.ReminderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reminders")
public class ReminderController {
    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<ReminderDto>> getAllReminders() {
        List<ReminderDto> reminders = reminderService.findReminders(null);
        log.info("Retrieved {} reminders", reminders.size());
        return ResponseEntity.ok().body(reminders);
    }

    @GetMapping("/request/{requestId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<ReminderDto>> getRemindersByRequest(@PathVariable Long requestId) {
        List<ReminderDto> requestReminders = reminderService.findReminders(requestId);
        log.info("Retrieved {} reminders for request {}", requestReminders.size(), requestId);
        return ResponseEntity.ok().body(requestReminders);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ReminderDto> createReminder(@Valid @RequestBody CreateReminderDto createReminderDto) {
        ReminderDto reminder = reminderService.createReminder(createReminderDto);
        log.info("Created reminder with id {}", reminder.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(reminder);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ReminderDto updateReminder(@Valid @RequestBody UpdateReminderDto updateReminderDto) {
        ReminderDto updatedReminder = reminderService.updateReminder(updateReminderDto);
        log.info("Updated reminder with id {}", updatedReminder.id());
        return updatedReminder;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteReminder(@PathVariable long id) {
        reminderService.deleteReminder(id);
        log.info("Deleted reminder with id {}", id);
        return ResponseEntity.noContent().build();
    }
}
