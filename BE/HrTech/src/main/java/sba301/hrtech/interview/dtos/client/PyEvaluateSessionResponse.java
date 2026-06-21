package sba301.hrtech.interview.dtos.client;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PyEvaluateSessionResponse {
    private Double overallScore;
    private Double technicalScore;
    private Double communicationScore;
    private Double softSkillsScore;
    private List<String> strengths;
    private List<String> weaknesses;
    private String generalFeedback;
    private List<DetailedFeedbackItem> detailedFeedback;
}
