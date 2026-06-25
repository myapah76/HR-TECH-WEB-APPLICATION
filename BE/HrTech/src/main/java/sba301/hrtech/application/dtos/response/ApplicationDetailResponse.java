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
    private UUID cvId;
    private String cvTitle;
    private String coverLetter;
    private ApplicationStatus status;
    private Instant appliedAt;

    // Thông tin AI chấm điểm
    private BigDecimal overallScore;
    private String grade;
    private String aiSummary;
    private String aiSuggestion;
}
