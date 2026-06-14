package sba301.hrtech.company.entities;

import sba301.hrtech.shared.common.SoftDeleteEntity;
import java.util.List;
import java.util.ArrayList;

import sba301.hrtech.job.entities.Job;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.company.entities.enums.CompanySize;
import sba301.hrtech.company.entities.enums.CompanyStatus;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private List<Job> jobs = new ArrayList<>();

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompanyMember> members = new ArrayList<>();

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
}






