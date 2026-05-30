package sba301.hrtech.subscription.entities;

import sba301.hrtech.auth.entities.User;
import sba301.hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "candidate_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSubscription extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status;

    @OneToMany(mappedBy = "candidateSubscription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();
}






