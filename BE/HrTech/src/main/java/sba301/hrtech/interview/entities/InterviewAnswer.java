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
    // URL của file ghi âm lưu trữ trên Cloudinary
    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;
    // Điểm số của câu trả lời này (thang điểm 10)
    private Double score;
    // Nhận xét chi tiết cho câu trả lời này
    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
    // Câu trả lời tối ưu gợi ý của AI
    @Column(name = "model_answer", columnDefinition = "TEXT")
    private String modelAnswer;
}
