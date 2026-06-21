package sba301.hrtech.interview.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;
import sba301.hrtech.interview.dtos.response.QuestionResponse;
import sba301.hrtech.interview.entities.InterviewQuestion;

import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface InterviewQuestionMapper {
    QuestionResponse toResponse(InterviewQuestion question);

    List<QuestionResponse> toResponseList(List<InterviewQuestion> questions);
}
