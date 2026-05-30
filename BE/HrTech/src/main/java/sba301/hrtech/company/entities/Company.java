package sba301.hrtech.company.entities;

import sba301.hrtech.shared.common.SoftDeleteEntity;
import java.util.List;
import java.util.ArrayList;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.subscription.entities.CompanySubscription;
import sba301.hrtech.job.entities.Job;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.company.entities.enums.CompanySize;

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
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompanySubscription> subscriptions = new ArrayList<>();

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Job> jobs = new ArrayList<>();
}






