package sba301.hrtech.application.dtos.response;

import lombok.*;
import sba301.hrtech.application.entities.enums.ApplicationStatus;

import java.math.BigDecimal;
import java.time.Instant;
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
    private String companyName;
    private String companyAddress;
    private UUID cvId;
    private String cvTitle;
    private String coverLetter;
    private ApplicationStatus status;
    private Instant appliedAt;
    private Instant interviewDateTime;
    private String interviewLocation;
    private String interviewMeetingLink;
    private String interviewNote;
    private String candidateInterviewResponseMessage;
    private Instant candidatePreferredInterviewDateTime;

    // Thông tin AI chấm điểm
    private BigDecimal overallScore;
    private String grade;
    private String aiSummary;
    private String aiSuggestion;
}
