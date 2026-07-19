package hrtech.subscription.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "candidate_subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE candidate_subscription_plans SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class CandidateSubscriptionPlan extends SoftDeleteEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private Long price;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "ai_credit_balance", nullable = false)
    @Builder.Default
    private Integer aiCreditBalance = 0;

    @Column(name = "daily_ai_limit", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer dailyAiLimit = 0;

    @Column(name = "weekly_ai_limit", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer weeklyAiLimit = 0;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidatePlanFeature> planFeatures;
}
