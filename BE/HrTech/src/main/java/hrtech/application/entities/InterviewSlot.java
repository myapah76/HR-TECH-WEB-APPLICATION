package hrtech.application.entities;

import hrtech.shared.common.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;

@Entity
@Table(name = "interview_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE interview_slots SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class InterviewSlot extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_interview_round_id", nullable = false)
    private ApplicationInterviewRound applicationInterviewRound;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    private String location;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "is_selected", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isSelected = false;

    @Column(name = "is_new_slot", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isNewSlot = false;
}
