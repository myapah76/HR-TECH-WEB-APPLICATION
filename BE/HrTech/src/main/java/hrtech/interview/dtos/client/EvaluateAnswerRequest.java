package hrtech.interview.dtos.client;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluateAnswerRequest {
    private String cv_text;
    private String jd_text;
    private String question;
    private String audio_url;
}
