package sba301.hrtech.interview.dtos.client;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PyInterviewQAItem {
    private String question;
    private String answer;
}
