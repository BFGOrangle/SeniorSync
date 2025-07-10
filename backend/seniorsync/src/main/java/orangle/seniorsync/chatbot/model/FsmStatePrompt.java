package orangle.seniorsync.chatbot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "fsm_state_prompts", schema = "senior_sync")
public class FsmStatePrompt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 100)
    @NotNull
    @Column(name = "campaign_name", nullable = false, length = 100)
    private String campaignName;

    @Size(max = 50)
    @NotNull
    @Column(name = "state", nullable = false, length = 50)
    private String state;

    @Size(max = 5)
    @NotNull
    @Column(name = "language_code", nullable = false, length = 5)
    private String languageCode;

    @NotNull
    @Column(name = "prompt", nullable = false, length = Integer.MAX_VALUE)
    private String prompt;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;
}