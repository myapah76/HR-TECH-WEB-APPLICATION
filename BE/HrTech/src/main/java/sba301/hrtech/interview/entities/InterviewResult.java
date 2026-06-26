package sba301.hrtech.interview.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import sba301.hrtech.shared.common.BaseEntity;

import java.util.List;

@Entity
@Table(name = "interview_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewResult extends BaseEntity {

    // Khóa ngoại liên kết 1-1 sang phiên phỏng vấn (UNIQUE)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private InterviewSession session;

    // Điểm số trung bình chung (thang điểm 10)
    private Double overallScore;

    // Điểm thành phần chuyên môn
    private Double technicalScore;

    // Điểm thành phần khả năng giao tiếp
    private Double communicationScore;

    // Điểm thành phần kỹ năng mềm
    private Double softSkillsScore;

    // Nhận xét điểm mạnh (Lưu trữ JSON dạng String hoặc TEXT dài)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> strengths;

    // Nhận xét điểm yếu cần cải thiện (TEXT)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> weaknesses;

    // Nhận xét tổng quát
    @Column(columnDefinition = "TEXT")
    private String generalFeedback;
}
