package orangle.seniorsync.crm.requestmanagement.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.requestmanagement.dto.CreateReminderDto;
import orangle.seniorsync.crm.requestmanagement.dto.ReminderDto;
import orangle.seniorsync.crm.requestmanagement.service.ReminderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/{id}")
    public ResponseEntity<List<ReminderDto>> getReminders(@PathVariable Long id) {
        List<ReminderDto> requestReminders = reminderService.findReminders(id);
        log.info("Retrieved {} reminders for request {}", requestReminders.size(), id);
        return ResponseEntity.ok().body(requestReminders);
    }

    @PostMapping
    public ResponseEntity<ReminderDto> createReminder(@Valid @RequestBody CreateReminderDto createReminderDto) {
        ReminderDto reminder = reminderService.createReminder(createReminderDto);
        log.info("Created reminder with id {}", reminder.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(reminder);
    }
}
