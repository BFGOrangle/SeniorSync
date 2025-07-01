package orangle.seniorsync.crm.requestmanagement.repository;

import orangle.seniorsync.crm.requestmanagement.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByRequestId(Long requestId);
}
