package hrtech.application.dtos.response;

import lombok.*;
import hrtech.application.entities.enums.ApplicationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailResponse {
    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private String candidateName;
    private String companyName;
    private String companyAddress;
    private UUID cvId;
    private String cvTitle;
    private String coverLetter;
    private ApplicationStatus status;
    private Instant appliedAt;

    // ── Interview Round Details ──
    private String interviewRoundStatus;
    private Instant interviewDateTime;
    private Instant candidatePreferredInterviewDateTime;
    private String candidateInterviewResponseMessage;
    private String interviewLocation;
    private String interviewMeetingLink;
    private String interviewNote;
    private List<ApplicationInterviewRoundResponse> interviewRounds;

    // Thông tin AI chấm điểm
    private BigDecimal overallScore;
    private String grade;
    private String aiSummary;
    private String aiSuggestion;
}
