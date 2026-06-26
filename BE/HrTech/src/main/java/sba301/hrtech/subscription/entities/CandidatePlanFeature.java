package sba301.hrtech.subscription.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "candidate_plan_features",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"plan_id", "feature_id"})
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

    @Column(name = "total_quota", nullable = false)
    private Integer totalQuota;

    @OneToMany(mappedBy = "planFeature", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CandidatePlanFeatureRateLimit> rateLimits = new ArrayList<>();
}
