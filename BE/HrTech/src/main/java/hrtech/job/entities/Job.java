package hrtech.job.entities;

import hrtech.identity.entities.User;
import hrtech.company.entities.Company;
import hrtech.shared.common.SoftDeleteEntity;
import hrtech.shared.enums.ExtractionStatus;

import java.util.ArrayList;
import java.util.List;
import hrtech.application.entities.Application;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.*;
import lombok.*;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.entities.enums.JobType;
import hrtech.job.entities.enums.SalaryType;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE jobs SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Job extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(nullable = false)
    private String title;

    private String position;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    @Column(name = "salary_min", precision = 19, scale = 4)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 19, scale = 4)
    private BigDecimal salaryMax;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SalaryType salaryType = SalaryType.MONTHLY;

    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobStatus status = JobStatus.DRAFT;

    @Column(name = "appeal_count", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer appealCount = 0;

    public int getAppealCount() {
        return appealCount != null ? appealCount : 0;
    }

    private Instant deadline;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Enumerated(EnumType.STRING)
    private ExtractionStatus extractionStatus;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    @Builder.Default
    private List<JobSkill> jobSkills = new ArrayList<>();

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("roundNumber ASC")
    @Builder.Default
    private List<JobInterviewRound> interviewRounds = new ArrayList<>();
}
