package orangle.seniorsync.chatbot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "fsm_transitions", schema = "senior_sync")
public class FsmTransition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "campaign_name", length = Integer.MAX_VALUE)
    private String campaignName;

    @Column(name = "trigger", length = Integer.MAX_VALUE)
    private String trigger;

    @Column(name = "source_state", length = Integer.MAX_VALUE)
    private String sourceState;

    @Column(name = "dest_state", length = Integer.MAX_VALUE)
    private String destState;

    @Column(name = "guard_name", length = Integer.MAX_VALUE)
    private String guardName;

    @Column(name = "action_name", length = Integer.MAX_VALUE)
    private String actionName;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

}