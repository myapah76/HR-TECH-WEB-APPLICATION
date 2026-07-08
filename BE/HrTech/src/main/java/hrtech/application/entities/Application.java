package hrtech.application.entities;

import hrtech.identity.entities.User;
import hrtech.cv.entities.Cv;
import hrtech.job.entities.Job;
import hrtech.shared.common.SoftDeleteEntity;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.*;
import lombok.*;
import hrtech.application.entities.enums.ApplicationStatus;

import java.time.Instant;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE applications SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Application extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private Cv cv;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "applied_at")
    private Instant appliedAt;

    @Column(name = "interview_date_time")
    private Instant interviewDateTime;

    @Column(name = "interview_location")
    private String interviewLocation;

    @Column(name = "interview_meeting_link")
    private String interviewMeetingLink;

    @Column(name = "interview_note", columnDefinition = "TEXT")
    private String interviewNote;

    @Column(name = "interview_accepted_at")
    private Instant interviewAcceptedAt;

    @Column(name = "candidate_interview_response_message", columnDefinition = "TEXT")
    private String candidateInterviewResponseMessage;

    @Column(name = "candidate_preferred_interview_date_time")
    private Instant candidatePreferredInterviewDateTime;

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ApplicationScore applicationScore;
}
