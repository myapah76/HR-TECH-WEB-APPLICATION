package hrtech.interview.dtos.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailedFeedbackItem {
    private String question;
    private String audioUrl;
    private Double score;
    private String feedback;
    private String modelAnswer;
}
