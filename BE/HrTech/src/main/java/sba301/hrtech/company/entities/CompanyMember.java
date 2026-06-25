package sba301.hrtech.company.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.company.entities.enums.CompanyRole;
import sba301.hrtech.company.entities.enums.MembershipStatus;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.shared.common.SoftDeleteEntity;
import java.time.Instant;

@Entity
@Table(name = "company_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE company_members SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class CompanyMember extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_role", nullable = false)
    private CompanyRole companyRole;

    @Column(name = "joined_at")
    private Instant joinedAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "membership_status", nullable = false)
    private MembershipStatus membershipStatus = MembershipStatus.ACTIVE;
}
