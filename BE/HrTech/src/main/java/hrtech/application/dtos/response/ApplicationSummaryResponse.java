package hrtech.application.dtos.response;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import hrtech.application.entities.enums.ApplicationStatus;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationSummaryResponse {

    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private UUID cvId;
    private String cvTitle;
    private ApplicationStatus status;
    private Instant appliedAt;
    private Instant interviewDateTime;
    private Instant candidatePreferredInterviewDateTime;
}
