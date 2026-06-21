package sba301.hrtech.interview.dtos.response;

import java.util.UUID;

public record QuestionResponse(
        UUID id,
        String questionText,
        Integer orderIndex
) {
}
