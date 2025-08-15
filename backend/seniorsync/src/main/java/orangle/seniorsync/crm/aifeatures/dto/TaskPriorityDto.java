package orangle.seniorsync.crm.aifeatures.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskPriorityDto {
    private Long taskId;
    private Integer priorityScore; // 1-10
    private String priorityReason;
    private String urgencyLevel; // HIGH, MEDIUM, LOW
    private LocalDateTime createdAt;
}
