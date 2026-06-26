package sba301.hrtech.subscription.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import sba301.hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "candidate_sub_feature_usages",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"subscription_id", "feature_id"})
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

    @Column(name = "total_quota", nullable = false)
    private Integer totalQuota;

    @Column(name = "total_used", nullable = false)
    @Builder.Default
    private Integer totalUsed = 0;

    @OneToMany(mappedBy = "usage", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CandidateSubFeatureRateUsage> rateUsages = new ArrayList<>();
}
