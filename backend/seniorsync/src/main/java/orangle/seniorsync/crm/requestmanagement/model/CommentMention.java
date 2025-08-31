package orangle.seniorsync.crm.requestmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "comment_mentions", schema = "senior_sync")
public class CommentMention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "comment_id", nullable = false)
    private Long commentId;

    @NotNull
    @Column(name = "mentioned_staff_id", nullable = false)
    private Long mentionedStaffId;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Foreign key relationships (optional - for better querying)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", insertable = false, updatable = false)
    private RequestComment requestComment;
}