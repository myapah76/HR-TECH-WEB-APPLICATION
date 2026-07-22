package hrtech.job.dtos.response;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record JobInterviewRoundResponse(
        UUID id,
        UUID jobId,
        Integer roundNumber,
        String roundName,
        String description,
        Instant createdAt,
        Instant updatedAt
) {
}
