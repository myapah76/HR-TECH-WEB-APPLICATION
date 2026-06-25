package sba301.hrtech.subscription.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;
import sba301.hrtech.subscription.entities.enums.ResetType;

@Entity
@Table(
        name = "candidate_plan_features",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"plan_id", "feature_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatePlanFeature extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private CandidateSubscriptionPlan plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @Column(nullable = false)
    private Integer quota;

    @Enumerated(EnumType.STRING)
    @Column(name = "reset_type", nullable = false)
    @Builder.Default
    private ResetType resetType = ResetType.TOTAL;
}
