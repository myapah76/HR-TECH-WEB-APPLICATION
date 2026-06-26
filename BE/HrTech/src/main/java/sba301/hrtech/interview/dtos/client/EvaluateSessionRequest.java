package sba301.hrtech.interview.dtos.client;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluateSessionRequest {
    private String cv_text;
    private String jd_text;
    private List<InterviewQAItem> history;
}
