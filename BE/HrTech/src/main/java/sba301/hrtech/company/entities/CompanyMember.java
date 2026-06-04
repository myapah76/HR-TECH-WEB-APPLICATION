package sba301.hrtech.company.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.company.entities.enums.CompanyRole;
import sba301.hrtech.shared.common.SoftDeleteEntity;

@Entity
@Table(name = "company_members")
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
    @Column(nullable = false)
    private CompanyRole role;
}

