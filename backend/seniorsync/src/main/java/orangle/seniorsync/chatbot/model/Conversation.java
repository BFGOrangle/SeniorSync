package orangle.seniorsync.chatbot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "conversations", schema = "senior_sync")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "senior_id", nullable = false)
    private Long seniorId;

    @Size(max = 100)
    @NotNull
    @Column(name = "campaign_name", nullable = false, length = 100)
    private String campaignName;

    @Size(max = 100)
    @NotNull
    @Column(name = "current_state", nullable = false, length = 100)
    private String currentState;

    @Column(name = "context")
    private byte[] context;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

}