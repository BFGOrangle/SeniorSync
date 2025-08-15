package orangle.seniorsync.crm.aifeatures.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import orangle.seniorsync.crm.aifeatures.model.AIRecommendation;
import java.util.List;
import java.util.Optional;

@Repository
public interface AIRecommendationRepository extends JpaRepository<AIRecommendation, Long> {
    Optional<AIRecommendation> findByRequestId(Long requestId);
    List<AIRecommendation> findByUserId(Long userId);
    List<AIRecommendation> findByStatus(AIRecommendation.ProcessingStatus status);

    @Query("SELECT ar FROM AIRecommendation ar WHERE ar.requestId IN :requestIds")
    List<AIRecommendation> findByRequestIds(@Param("requestIds") List<Long> requestIds);

    @Query("SELECT ar FROM AIRecommendation ar ORDER BY ar.priorityScore DESC, ar.createdAt DESC")
    List<AIRecommendation> findAllOrderedByPriority();
}