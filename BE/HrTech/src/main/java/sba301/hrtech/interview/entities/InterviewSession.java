package sba301.hrtech.interview.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.shared.common.SoftDeleteEntity;
import sba301.hrtech.interview.entities.enums.InterviewStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE interview_sessions SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class InterviewSession extends SoftDeleteEntity {
    // Liên kết tới người dùng (Candidate) đang thực hiện phỏng vấn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    // Liên kết tới CV được dùng để làm căn cứ hỏi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private Cv cv;
    // Liên kết tới Job đăng tuyển (có thể NULL nếu phỏng vấn tự do)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = true)
    private Job job;
    // Vị trí/Vai trò mục tiêu (VD: React Developer)
    @Column(name = "target_role", nullable = false)
    private String targetRole;
    // Trạng thái phiên phỏng vấn (IN_PROGRESS, COMPLETED, FAILED)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InterviewStatus status;
    @Column(name = "completed_at")
    private Instant completedAt;
    // Liên kết 1-N tới danh sách câu hỏi
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InterviewQuestion> questions = new ArrayList<>();
    // Liên kết 1-1 tới kết quả đánh giá cuối cùng
    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private InterviewResult result;
}
