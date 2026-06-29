package sba301.hrtech.subscription.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.Instant;

@Entity
@Table(name = "candidate_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE candidate_subscriptions SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class CandidateSubscription extends SoftDeleteEntity {

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private CandidateSubscriptionPlan plan;
}
