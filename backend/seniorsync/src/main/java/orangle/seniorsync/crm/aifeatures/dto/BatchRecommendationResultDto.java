package orangle.seniorsync.crm.aifeatures.dto;

import lombok.Data;
import java.util.List;

@Data
public class BatchRecommendationResultDto {
    private List<AIRecommendedRequestDto> recommendations;
    private List<AIRecommendedRequestDto> failures;
    private int totalProcessed;
    private int successCount;
    private int failureCount;
}
