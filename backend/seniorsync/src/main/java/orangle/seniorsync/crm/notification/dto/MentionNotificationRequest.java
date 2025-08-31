package orangle.seniorsync.crm.notification.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MentionNotificationRequest {
    @NotNull
    private Long requestId;
    
    @NotNull
    private Long commentId;
    
    @NotEmpty
    private List<Long> mentionedStaffIds;
    
    @NotNull
    private String commenterName;
    
    @NotNull
    private String commentText;
    
    private String requestTitle;
}