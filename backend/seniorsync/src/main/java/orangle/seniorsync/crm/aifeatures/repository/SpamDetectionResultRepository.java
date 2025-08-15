package orangle.seniorsync.crm.aifeatures.repository;

import orangle.seniorsync.crm.aifeatures.model.SpamDetectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpamDetectionResultRepository extends JpaRepository<SpamDetectionResult, Long> {

    Optional<SpamDetectionResult> findTopByRequestIdOrderByDetectedAtDesc(Long requestId);

    Optional<SpamDetectionResult> findByRequestId(Long requestId);

    List<SpamDetectionResult> findByRequestIdIn(List<Long> requestIds);

    @Query("SELECT s FROM SpamDetectionResult s WHERE s.isSpam = true ORDER BY s.detectedAt DESC")
    List<SpamDetectionResult> findAllSpamResults();

    @Query("SELECT COUNT(s) FROM SpamDetectionResult s WHERE s.isSpam = true")
    Long countSpamDetections();
}
