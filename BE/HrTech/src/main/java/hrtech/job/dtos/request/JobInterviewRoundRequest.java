package hrtech.job.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record JobInterviewRoundRequest(
        @NotBlank(message = "Tên vòng phỏng vấn không được để trống")
        String roundName,

        String description
) {
}
