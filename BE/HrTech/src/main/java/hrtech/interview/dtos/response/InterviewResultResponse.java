package hrtech.interview.dtos.response;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewResultResponse {
    private UUID sessionId;
    private Double overallScore;
    private Double technicalScore;
    private Double communicationScore;
    private Double softSkillsScore;

    // Sử dụng Object để Jackson tự động chuyển đổi chuỗi JSON thô thành mảng/đối tượng JSON chuẩn khi trả về Frontend
    private Object strengths;
    private Object weaknesses;
    private String generalFeedback;
    private List<DetailedFeedbackItem> detailedFeedback;
}
