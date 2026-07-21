package hrtech.job.entities;

import hrtech.shared.common.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "job_interview_rounds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE job_interview_rounds SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class JobInterviewRound extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "round_name", nullable = false)
    private String roundName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
