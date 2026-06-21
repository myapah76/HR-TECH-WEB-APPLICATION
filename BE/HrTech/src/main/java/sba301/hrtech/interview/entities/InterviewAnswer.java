package sba301.hrtech.interview.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;

@Entity
@Table(name = "interview_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer extends BaseEntity {

    // Khóa ngoại liên kết 1-1 sang câu hỏi (UNIQUE)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private InterviewQuestion question;

    // Nội dung câu trả lời của ứng viên (Dùng TEXT vì ứng viên có thể nói dài)
    @Column(name = "answer_text", nullable = false, columnDefinition = "TEXT")
    private String answerText;
}
