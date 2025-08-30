package orangle.seniorsync.crm.reminder.repository;

import orangle.seniorsync.crm.reminder.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByRequestId(Long requestId);
    List<Reminder> findByReminderDateBetween(OffsetDateTime start, OffsetDateTime end);
    List<Reminder> findByReminderDateAfter(OffsetDateTime dateTime);
}
