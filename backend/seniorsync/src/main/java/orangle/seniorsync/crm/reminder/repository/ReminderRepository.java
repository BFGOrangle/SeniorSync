package orangle.seniorsync.crm.reminder.repository;

import orangle.seniorsync.crm.reminder.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.OffsetDateTime;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long>, JpaSpecificationExecutor<Reminder> {
    List<Reminder> findByRequestId(Long requestId);
    List<Reminder> findByReminderDateBetween(OffsetDateTime start, OffsetDateTime end);
    List<Reminder> findByReminderDateAfter(OffsetDateTime dateTime);
}
