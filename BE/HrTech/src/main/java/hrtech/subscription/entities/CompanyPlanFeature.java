package hrtech.subscription.entities;

import jakarta.persistence.*;
import lombok.*;
import hrtech.shared.common.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "company_plan_features",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"plan_id", "feature_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyPlanFeature extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private CompanySubscriptionPlan plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @Column(name = "ai_credit_cost", nullable = false)
    @Builder.Default
    private Integer aiCreditCost = 0;

    @OneToMany(mappedBy = "planFeature", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CompanyPlanFeatureRateLimit> rateLimits = new ArrayList<>();
}
