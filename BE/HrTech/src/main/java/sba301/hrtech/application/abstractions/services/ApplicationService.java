package sba301.hrtech.application.abstractions.services;

import sba301.hrtech.application.dtos.response.ApplicationDetailResponse;
import sba301.hrtech.application.dtos.response.ApplicationSummaryResponse;
import sba301.hrtech.application.dtos.request.ChangeInterviewScheduleRequest;
import sba301.hrtech.application.dtos.request.ScheduleInterviewRequest;
import sba301.hrtech.application.dtos.request.SubmitApplicationRequest;
import sba301.hrtech.application.entities.enums.ApplicationStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface ApplicationService {
    ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request);
    Page<ApplicationSummaryResponse> getMyApplications(UUID userId, Pageable pageable);
    ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId);
    void withdrawApplication(UUID userId, UUID applicationId);
    ApplicationSummaryResponse updateStatus(UUID applicationId, ApplicationStatus newStatus);
    ApplicationSummaryResponse scheduleInterview(UUID applicationId, ScheduleInterviewRequest request);
    ApplicationSummaryResponse acceptInterviewSchedule(UUID userId, UUID applicationId);
    ApplicationSummaryResponse changeInterviewSchedule(UUID userId, UUID applicationId, ChangeInterviewScheduleRequest request);
    ApplicationSummaryResponse acceptCandidateReschedule(UUID applicationId);
    ApplicationSummaryResponse rejectCandidateReschedule(UUID applicationId);
    Page<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId, Pageable pageable);
    ApplicationDetailResponse scoreApplication(UUID userId, UUID applicationId);
    boolean hasApplied(UUID userId, UUID jobId);
}
