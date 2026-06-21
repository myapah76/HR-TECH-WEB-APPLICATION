package sba301.hrtech.interview.dtos.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.interview.entities.enums.InterviewStatus;

import java.util.UUID;

@Builder
@Getter
@Setter
public class SessionStartResponse {
    private UUID sessionId;
    private String targetRole;
    private InterviewStatus status;
    private Integer totalQuestions;
    private QuestionResponse currentQuestion;
}
