package orangle.seniorsync.crm.requestmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "request_comments", schema = "senior_sync")
public class RequestComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "request_id", nullable = false)
    private SeniorRequest request;

    @NotNull
    @Column(name = "commenter_id", nullable = false)
    private Long commenterId;

    @NotNull
    @Column(name = "comment_type", nullable = false, length = Integer.MAX_VALUE)
    private String commentType;

    @NotNull
    @Column(name = "comment", nullable = false, length = Integer.MAX_VALUE)
    private String comment;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}