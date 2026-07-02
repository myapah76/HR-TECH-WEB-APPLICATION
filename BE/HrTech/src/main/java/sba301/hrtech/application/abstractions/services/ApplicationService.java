package sba301.hrtech.application.abstractions.services;

import sba301.hrtech.application.dtos.response.ApplicationDetailResponse;
import sba301.hrtech.application.dtos.response.ApplicationSummaryResponse;
import sba301.hrtech.application.dtos.request.ChangeInterviewScheduleRequest;
import sba301.hrtech.application.dtos.request.ScheduleInterviewRequest;
import sba301.hrtech.application.dtos.request.SubmitApplicationRequest;
import sba301.hrtech.application.entities.enums.ApplicationStatus;

import java.util.List;
import java.util.UUID;

public interface ApplicationService {
    ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request);
    List<ApplicationSummaryResponse> getMyApplications(UUID userId);
    ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId);
    void withdrawApplication(UUID userId, UUID applicationId);
    ApplicationSummaryResponse updateStatus(UUID applicationId, ApplicationStatus newStatus);
    ApplicationSummaryResponse scheduleInterview(UUID applicationId, ScheduleInterviewRequest request);
    ApplicationSummaryResponse acceptInterviewSchedule(UUID userId, UUID applicationId);
    ApplicationSummaryResponse changeInterviewSchedule(UUID userId, UUID applicationId, ChangeInterviewScheduleRequest request);
    ApplicationSummaryResponse acceptCandidateReschedule(UUID applicationId);
    ApplicationSummaryResponse rejectCandidateReschedule(UUID applicationId);
    List<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId);
    ApplicationDetailResponse scoreApplication(UUID userId, UUID applicationId);
}
