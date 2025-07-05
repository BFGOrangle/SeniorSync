package orangle.seniorsync.chatbot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extended_state", nullable = false, columnDefinition = "jsonb")
    private Map<Object, Object> extendedState;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

}