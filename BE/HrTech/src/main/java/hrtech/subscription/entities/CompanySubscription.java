package hrtech.subscription.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import hrtech.company.entities.Company;
import hrtech.identity.entities.User;
import hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;
import hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.Instant;

@Entity
@Table(name = "company_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE company_subscriptions SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class CompanySubscription extends SoftDeleteEntity {

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchased_by", nullable = false)
    private User purchasedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private CompanySubscriptionPlan plan;

    @Column(name = "daily_ai_usage", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer dailyAiUsage = 0;

    @Column(name = "weekly_ai_usage", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer weeklyAiUsage = 0;

    @Column(name = "last_daily_reset")
    private Instant lastDailyReset;

    @Column(name = "last_weekly_reset")
    private Instant lastWeeklyReset;
}
