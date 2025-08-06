package orangle.seniorsync.crm.requestmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import orangle.seniorsync.common.model.Center;
import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "senior_requests", schema = "senior_sync")
@Filter(name = "tenantFilter", condition = "center_id = :centerId")
public class SeniorRequest {
    // FYI:
    // With GenerationType.IDENTITY, the database is responsible for assigning the primary key value—Hibernate will:
    // Issue an INSERT without an id column (letting Postgres’s SERIAL or IDENTITY column fill it in).
    // Use JDBC’s getGeneratedKeys() (or PostgreSQL’s RETURNING id) to fetch the newly-created id from the database.
    // Populate your entity’s id field after the insert completes.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "senior_id", nullable = false)
    private Long seniorId;

    @Column(name = "assigned_staff_id")
    private Long assignedStaffId;

    @Column(name = "request_type_id")
    private Long requestTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    private Center center;

    @NotNull
    @Column(name = "title", nullable = false, length = Integer.MAX_VALUE)
    private String title;

    @NotNull
    @Column(name = "description", nullable = false, length = Integer.MAX_VALUE)
    private String description;

    @NotNull
    @ColumnDefault("1")
    @Column(name = "priority", nullable = false)
    private Short priority;

    // FYI:
    // By marking the column as insertable = false (and updatable = false), you tell Hibernate not to include that property in its INSERT (or UPDATE) statements. Here’s why that fixes the “not-null property references a null value” error:
    // insertable = false lets the database fill in the creation timestamp via its DEFAULT now() clause without Hibernate overwriting it with NULL.
    // updatable = false ensures that after the row is created, neither Hibernate nor your application code will ever try to change that original timestamp.
    // Combined with a DDL default (DEFAULT now() in your table definition), this makes the database the single source of truth for created_at.
    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    // This will be set to the current timestamp by the backend code when the status changes to COMPLETED.
    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    private RequestStatus status = RequestStatus.TODO;
}