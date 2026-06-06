package sba301.hrtech.application.dtos.response;

import lombok.*;
import sba301.hrtech.application.entities.enums.ApplicationStatus;

import java.time.LocalDateTime;
import java.util.UUID;
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
    private LocalDateTime appliedAt;
}
