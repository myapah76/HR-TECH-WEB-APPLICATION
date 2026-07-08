package hrtech.interview.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubmitAnswerRequest(
        @NotNull(message = "ID câu hỏi không được để trống")
        UUID questionId,
        @NotBlank(message = "URL âm thanh không được để trống")
        String audioUrl
) {
}
