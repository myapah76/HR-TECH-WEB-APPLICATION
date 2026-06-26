package sba301.hrtech.interview.dtos.client;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluateAnswerResponse {
    private Double score;
    private String feedback;
    private String modelAnswer;
}
