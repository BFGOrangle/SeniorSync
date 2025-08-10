package orangle.seniorsync.crm.aifeatures.dto;

import lombok.Data;
import java.util.List;

@Data
public class BatchSpamFilterRequestDto {
    private List<Long> requestIds;
}
