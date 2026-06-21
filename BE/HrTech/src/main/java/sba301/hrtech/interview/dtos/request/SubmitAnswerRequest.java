package sba301.hrtech.interview.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubmitAnswerRequest(
        @NotNull(message = "ID câu hỏi không được để trống")
        UUID questionId,
        @NotBlank(message = "Nội dung câu trả lời không được để trống")
        String answerText
) {
}
