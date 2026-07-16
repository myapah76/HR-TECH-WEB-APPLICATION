package hrtech.interview.dtos.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record StartSessionRequest(
        @NotNull(message = "CV ID không được để trống")
        UUID cvId,
        UUID jobId,
        @NotNull(message = "Vị trí tuyển dụng không được để trống")
        String targetRole,
        Integer numQuestions
) {}
