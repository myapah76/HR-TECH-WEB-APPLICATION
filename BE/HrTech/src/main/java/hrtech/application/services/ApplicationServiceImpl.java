package hrtech.application.services;

import hrtech.application.abstractions.services.ApplicationService;
import hrtech.application.dtos.request.ChangeInterviewScheduleRequest;
import hrtech.application.dtos.request.ScheduleInterviewRequest;
import hrtech.application.dtos.request.SubmitApplicationRequest;
import hrtech.application.dtos.request.UpdateApplicationStatusRequest;
import hrtech.application.dtos.response.ApplicationDetailResponse;
import hrtech.application.dtos.response.ApplicationSummaryResponse;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationQueryService queryService;
    private final ApplicationCommandService commandService;
    private final ApplicationScoringService scoringService;

    @Override
    public ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request) {
        return commandService.submitApplication(userId, request);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationSummaryResponse> getMyApplications(UUID userId, Pageable pageable) {
        return queryService.getMyApplications(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId) {
        return queryService.getApplicationDetail(userId, applicationId);
    }

    @Override
    public void withdrawApplication(UUID userId, UUID applicationId) {
        commandService.withdrawApplication(userId, applicationId);
    }

    @Override
    public ApplicationSummaryResponse updateStatus(UUID applicationId, UpdateApplicationStatusRequest request) {
        return commandService.updateStatus(applicationId, request);
    }

    @Override
    public ApplicationSummaryResponse scheduleInterview(UUID applicationId, ScheduleInterviewRequest request) {
        return commandService.scheduleInterview(applicationId, request);
    }

    @Override
    public ApplicationSummaryResponse acceptInterviewSchedule(UUID userId, UUID applicationId) {
        return commandService.acceptInterviewSchedule(userId, applicationId);
    }

    @Override
    public ApplicationSummaryResponse changeInterviewSchedule(UUID userId, UUID applicationId,
            ChangeInterviewScheduleRequest request) {
        return commandService.changeInterviewSchedule(userId, applicationId, request);
    }

    @Override
    public ApplicationSummaryResponse acceptCandidateReschedule(UUID applicationId) {
        return commandService.acceptCandidateReschedule(applicationId);
    }

    @Override
    public ApplicationSummaryResponse rejectCandidateReschedule(UUID applicationId) {
        return commandService.rejectCandidateReschedule(applicationId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId, Pageable pageable) {
        return queryService.getApplicationsByJob(jobId, pageable);
    }

    @Override
    public ApplicationDetailResponse scoreApplication(UUID userId, UUID applicationId) {
        return scoringService.scoreApplication(userId, applicationId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasApplied(UUID userId, UUID jobId) {
        return queryService.hasApplied(userId, jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countApplicationsByStatus(ApplicationStatus status) {
        return queryService.countApplicationsByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long countApplicationsByUserId(UUID userId) {
        return queryService.countApplicationsByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countApplicationsByUserIdAndStatus(UUID userId, ApplicationStatus status) {
        return queryService.countApplicationsByUserIdAndStatus(userId, status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getRecentApplications(UUID userId, int limit) {
        return queryService.getRecentApplications(userId, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getUpcomingInterviews(UUID userId) {
        return queryService.getUpcomingInterviews(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getAllApplicationsByUserId(UUID userId) {
        return queryService.getAllApplicationsByUserId(userId);
    }
}