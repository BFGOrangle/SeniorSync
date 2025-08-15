package orangle.seniorsync.crm.aifeatures.dto;

import lombok.Data;

import java.util.List;

@Data
public class BatchRecommendationRequestDto {
    private List<Long> requestIds;
    private Long userId;
    private boolean includePriorityRanking;
}
