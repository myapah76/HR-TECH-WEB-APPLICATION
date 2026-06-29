package sba301.hrtech.application.dtos.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CandidateInterviewResponseRequest(
        @NotNull(message = "Preferred interview date/time is required")
        @Future(message = "Preferred interview date/time must be in the future")
        Instant preferredInterviewDateTime,

        @NotBlank(message = "Reason is required")
        String reason
) {
}
