package orangle.seniorsync.crm.reminder.repository;

import orangle.seniorsync.crm.reminder.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByRequestId(Long requestId);
    List<Reminder> findByReminderDate(Date reminderDate);
}
