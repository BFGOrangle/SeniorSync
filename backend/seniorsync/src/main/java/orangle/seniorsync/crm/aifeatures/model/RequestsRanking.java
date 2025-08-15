package orangle.seniorsync.crm.aifeatures.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "requests_ranking", schema = "senior_sync")
public class RequestsRanking {
    // With GenerationType.IDENTIFY, the database would automatically assign a primary key through auto-increment

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "priority_score")
    private Integer priorityScore;

    @Column(name = "ranking_factors")
    private String rankingFactors;
}