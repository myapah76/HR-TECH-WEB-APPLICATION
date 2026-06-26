package sba301.hrtech.subscription.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import sba301.hrtech.shared.common.SoftDeleteEntity;
import sba301.hrtech.subscription.entities.enums.ResetType;

import java.time.Instant;

@Entity
@Table(
        name = "company_sub_feature_rate_usages",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"usage_id", "reset_type"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE company_sub_feature_rate_usages SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class CompanySubFeatureRateUsage extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usage_id", nullable = false)
    private CompanySubFeatureUsage usage;

    @Enumerated(EnumType.STRING)
    @Column(name = "reset_type", nullable = false)
    private ResetType resetType;

    @Column(name = "cap_quota", nullable = false)
    private Integer capQuota;

    @Column(nullable = false)
    @Builder.Default
    private Integer used = 0;

    @Column(name = "last_reset_date")
    private Instant lastResetDate;
}
