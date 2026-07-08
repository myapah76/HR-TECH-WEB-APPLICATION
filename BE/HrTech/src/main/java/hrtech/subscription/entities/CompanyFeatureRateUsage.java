package hrtech.subscription.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import hrtech.company.entities.Company;
import hrtech.shared.common.SoftDeleteEntity;
import hrtech.subscription.entities.enums.ResetType;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
    name = "company_feature_rate_usages",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"company_id", "feature_id", "reset_type"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE company_feature_rate_usages SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class CompanyFeatureRateUsage extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @Enumerated(EnumType.STRING)
    @Column(name = "reset_type", nullable = false)
    private ResetType resetType;

    @Column(nullable = false)
    @Builder.Default
    private Integer used = 0;

    @Column(name = "last_reset_date", nullable = false)
    private Instant lastResetDate;
}
