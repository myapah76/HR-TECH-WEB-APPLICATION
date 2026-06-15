package sba301.hrtech.subscription.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;

@Entity
@Table(
        name = "plan_features",
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
public class PlanFeature extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private SubscriptionPlan plan;

    @ManyToOne
    @JoinColumn(name = "feature_id")
    private Feature feature;

    private Integer quota;
}
