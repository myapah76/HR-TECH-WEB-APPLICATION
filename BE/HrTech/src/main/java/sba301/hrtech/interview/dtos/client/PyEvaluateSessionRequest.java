package sba301.hrtech.interview.dtos.client;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PyEvaluateSessionRequest {
    private String cv_text;
    private String jd_text;
    private List<PyInterviewQAItem> history;
}
