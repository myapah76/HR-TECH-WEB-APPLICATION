package hrtech.application.dtos.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
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
    private String candidateName;
    private UUID cvId;
    private String cvTitle;
    private ApplicationStatus status;
    private Instant appliedAt;
    private BigDecimal overallScore;
    private String grade;

    // ── Interview Round Details ──
    private String interviewRoundStatus;
    private Integer rescheduleCount;
    private Instant candidatePreferredTime;
    private String candidateRescheduleReason;
    private Instant scheduledTime;
    private List<ApplicationInterviewRoundResponse> interviewRounds;
}
