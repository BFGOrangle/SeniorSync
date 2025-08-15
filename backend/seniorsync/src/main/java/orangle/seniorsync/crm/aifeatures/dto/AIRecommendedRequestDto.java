package orangle.seniorsync.crm.aifeatures.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class AIRecommendedRequestDto {
    private Long id;
    private Long requestId;
    private Long userId;
    private Integer priorityScore;
    private String priorityReason;
    private String urgencyLevel;
    private String recommendationText;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
