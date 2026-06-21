package sba301.hrtech.interview.dtos.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class AnswerSubmitResponse{
    private boolean isFinished;
    private QuestionResponse nextQuestion;
}
