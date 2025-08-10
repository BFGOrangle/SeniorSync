package orangle.seniorsync.crm.aifeatures.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class SpamFilterResultDto {
    private Long requestId;
    private Boolean isSpam;
    private BigDecimal confidenceScore;
    private String detectionReason;
    private OffsetDateTime detectedAt;
}
