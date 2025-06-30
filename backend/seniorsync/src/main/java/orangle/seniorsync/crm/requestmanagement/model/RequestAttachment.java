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
@Table(name = "request_attachments", schema = "senior_sync")
public class RequestAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @NotNull
    @Column(name = "file_url", nullable = false, length = Integer.MAX_VALUE)
    private String fileUrl;

    @ColumnDefault("now()")
    @Column(name = "uploaded_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime uploadedAt;

}