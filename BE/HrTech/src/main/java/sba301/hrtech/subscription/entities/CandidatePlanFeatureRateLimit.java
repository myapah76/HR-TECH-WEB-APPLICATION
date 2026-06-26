package sba301.hrtech.subscription.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;
import sba301.hrtech.subscription.entities.enums.ResetType;

@Entity
@Table(
        name = "candidate_plan_feature_rate_limits",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"plan_feature_id", "reset_type"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatePlanFeatureRateLimit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_feature_id", nullable = false)
    private CandidatePlanFeature planFeature;

    @Enumerated(EnumType.STRING)
    @Column(name = "reset_type", nullable = false)
    private ResetType resetType;

    @Column(name = "cap_quota", nullable = false)
    private Integer capQuota;
}
