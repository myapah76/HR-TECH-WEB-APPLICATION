package hrtech.interview.dtos.client;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQAItem {
    private String question;
    private Double score;
    private String feedback;
}
