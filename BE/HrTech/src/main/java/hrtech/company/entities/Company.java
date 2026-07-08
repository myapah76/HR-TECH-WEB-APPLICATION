package hrtech.company.entities;

import hrtech.shared.common.SoftDeleteEntity;
import java.util.List;

import hrtech.job.entities.Job;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.*;
import lombok.*;
import hrtech.company.entities.enums.CompanySize;
import hrtech.company.entities.enums.CompanyStatus;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE companies SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Company extends SoftDeleteEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    private String website;

    private String industry;

    @Enumerated(EnumType.STRING)
    private CompanySize size;

    private String address;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Job> jobs;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompanyMember> members;

    @Column(name = "tax_code", unique = true)
    private String taxCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanyStatus status;

    @Column(name = "related_weight")
    private Double relatedWeight;

    @Column(name = "child_to_parent_weight")
    private Double childToParentWeight;

    @Column(name = "parent_to_child_weight")
    private Double parentToChildWeight;

    @Builder.Default
    @Column(name = "ai_credit_balance", nullable = false)
    private Integer aiCreditBalance = 0;

    @Builder.Default
    @Column(name = "job_post_balance", nullable = false)
    private Integer jobPostBalance = 0;
}
