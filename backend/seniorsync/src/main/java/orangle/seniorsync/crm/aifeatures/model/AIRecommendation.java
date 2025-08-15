package orangle.seniorsync.crm.aifeatures.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_recommendations", schema = "senior_sync")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", unique = true)
    private Long requestId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "priority_score")
    private Integer priorityScore;

    @Column(name = "priority_reason", length = 1000)
    private String priorityReason;

    @Column(name = "urgency_level")
    private String urgencyLevel;

    @Column(name = "recommendation_text", length = 2000)
    private String recommendationText;

    @Column(name = "processing_status")
    @Enumerated(EnumType.STRING)
    private ProcessingStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ProcessingStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
}
