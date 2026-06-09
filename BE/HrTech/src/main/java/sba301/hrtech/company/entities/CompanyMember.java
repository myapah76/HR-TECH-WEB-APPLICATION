package sba301.hrtech.company.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.company.entities.enums.CompanyRole;
import sba301.hrtech.company.entities.enums.MembershipStatus;
import sba301.hrtech.shared.common.SoftDeleteEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private LocalDateTime joinedAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "membership_status", nullable = false)
    private MembershipStatus membershipStatus = MembershipStatus.ACTIVE;
}
