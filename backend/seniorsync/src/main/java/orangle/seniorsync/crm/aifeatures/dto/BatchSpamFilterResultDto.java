package orangle.seniorsync.crm.aifeatures.dto;

import lombok.Data;
import java.util.List;

@Data
public class BatchSpamFilterResultDto {
    private List<SpamFilterResultDto> results;
    private int totalProcessed;
    private int spamDetected;
}
