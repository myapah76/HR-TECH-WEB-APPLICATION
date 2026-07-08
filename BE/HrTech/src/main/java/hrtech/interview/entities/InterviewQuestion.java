package hrtech.interview.entities;

import jakarta.persistence.*;
import lombok.*;
import hrtech.shared.common.BaseEntity;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion extends BaseEntity {

    // Thuộc về phiên phỏng vấn nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    // Nội dung câu hỏi (Dùng TEXT để tránh tràn độ dài cột VARCHAR)
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    // Số thứ tự câu hỏi trong cuộc phỏng vấn (VD: 0, 1, 2, 3, 4)
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    // Liên kết 1-1 tới câu trả lời tương ứng
    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private InterviewAnswer answer;
}
