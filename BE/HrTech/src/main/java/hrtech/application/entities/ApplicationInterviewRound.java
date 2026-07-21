package hrtech.application.entities;

import hrtech.application.entities.enums.InterviewRoundStatus;
import hrtech.job.entities.JobInterviewRound;
import hrtech.shared.common.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "application_interview_rounds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE application_interview_rounds SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class ApplicationInterviewRound extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_interview_round_id", nullable = false)
    private JobInterviewRound jobInterviewRound;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterviewRoundStatus status = InterviewRoundStatus.NOT_STARTED;

    @Column(name = "scheduled_time")
    private Instant scheduledTime;

    private String location;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "candidate_preferred_time")
    private Instant candidatePreferredTime;

    @Column(name = "candidate_reschedule_reason", columnDefinition = "TEXT")
    private String candidateRescheduleReason;

    @Column(name = "reschedule_count", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer rescheduleCount = 0;

    @Column(name = "feedback_note", columnDefinition = "TEXT")
    private String feedbackNote;

    private Integer rating;

    @OneToMany(mappedBy = "applicationInterviewRound", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InterviewSlot> slots = new ArrayList<>();
}
