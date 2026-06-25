package sba301.hrtech.subscription.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import sba301.hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.subscription.entities.enums.ResetType;

import java.time.LocalDate;

@Entity
@Table(
    name = "candidate_sub_feature_usages",
    uniqueConstraints = {
        @UniqueConstraint(
                columnNames = {"subscription_id", "feature_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE candidate_sub_feature_usages SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class CandidateSubFeatureUsage extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private CandidateSubscription subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @Column(nullable = false)
    private Integer quota;

    @Column(nullable = false)
    @Builder.Default
    private Integer used = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "reset_type", nullable = false)
    @Builder.Default
    private ResetType resetType = ResetType.TOTAL;

    @Column(name = "last_reset_date")
    private LocalDate lastResetDate;
}
