package hrtech.application.abstractions.services;

import hrtech.application.dtos.response.ApplicationDetailResponse;
import hrtech.application.dtos.response.ApplicationSummaryResponse;
import hrtech.application.dtos.request.ChangeInterviewScheduleRequest;
import hrtech.application.dtos.request.ScheduleInterviewRequest;
import hrtech.application.dtos.request.SubmitApplicationRequest;
import hrtech.application.dtos.request.UpdateApplicationStatusRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;
import hrtech.application.entities.enums.ApplicationStatus;

public interface ApplicationService {
    ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request);
    Page<ApplicationSummaryResponse> getMyApplications(UUID userId, Pageable pageable);
    ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId);
    void withdrawApplication(UUID userId, UUID applicationId);
    ApplicationSummaryResponse updateStatus(UUID applicationId, UpdateApplicationStatusRequest request);
    ApplicationSummaryResponse scheduleInterview(UUID applicationId, ScheduleInterviewRequest request);
    ApplicationSummaryResponse acceptInterviewSchedule(UUID userId, UUID applicationId);
    ApplicationSummaryResponse changeInterviewSchedule(UUID userId, UUID applicationId, ChangeInterviewScheduleRequest request);
    ApplicationSummaryResponse acceptCandidateReschedule(UUID applicationId);
    ApplicationSummaryResponse rejectCandidateReschedule(UUID applicationId);
    Page<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId, Pageable pageable);
    ApplicationDetailResponse scoreApplication(UUID userId, UUID applicationId);
    boolean hasApplied(UUID userId, UUID jobId);
    long countApplicationsByStatus(ApplicationStatus status);
}
