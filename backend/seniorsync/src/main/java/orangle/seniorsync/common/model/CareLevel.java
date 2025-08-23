package orangle.seniorsync.common.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "care_level_types", schema = "senior_sync")
public class CareLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id", nullable = false)
    private Center center;

    @NotNull
    @Column(name = "care_level", nullable = false)
    private String careLevel;

    @NotNull
    @Column(name = "care_level_color", nullable = false)
    private String careLevelColor;
}
