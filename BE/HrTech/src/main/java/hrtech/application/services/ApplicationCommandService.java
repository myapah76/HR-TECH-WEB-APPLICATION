package hrtech.application.services;

import hrtech.application.abstractions.repositories.ApplicationRepository;
import hrtech.application.dtos.request.ChangeInterviewScheduleRequest;
import hrtech.application.dtos.request.ScheduleInterviewRequest;
import hrtech.application.dtos.request.SubmitApplicationRequest;
import hrtech.application.dtos.request.UpdateApplicationStatusRequest;
import hrtech.application.dtos.response.ApplicationSummaryResponse;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.application.mapper.ApplicationMapper;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.cv.entities.Cv;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.identity.entities.User;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.entities.Job;
import hrtech.job.entities.enums.JobStatus;
import hrtech.notification.abstractions.services.INotificationService;
import hrtech.notification.dtos.request.ApplicationStatusNotificationRequest;
import hrtech.notification.entities.enums.NotificationType;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.subscription.abstractions.services.ICreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationCommandService {

    private final IJobService jobService;
    private final ICvService cvService;
    private final IUserService userService;
    private final INotificationService notificationService;
    private final ICreditService creditService;
    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;

    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request) {
        User user = userService.getUserEntityById(userId);

        Job job = jobService.getJobEntityById(request.getJobId());

        if (job.getStatus() != JobStatus.APPROVED) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Job is not APPROVED for applications");
        }

        Cv cv = cvService.getCvEntityById(request.getCvId());

        if (!cv.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED, "CV does not belong to user");
        }

        if (applicationRepository.existsByUserIdAndJobIdAndStatusNotIn(
                userId,
                job.getId(),
                List.of(ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN))) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Already applied to this job");
        }

        // Create application
        Application application = Application.builder()
                .user(user)
                .job(job)
                .cv(cv)
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.SUBMITTED)
                .appliedAt(Instant.now())
                .build();

        application = applicationRepository.save(application);

        // Gửi thông báo đến nhà tuyển dụng (người đăng tuyển công việc này)
        if (job.getCreatedBy() != null) {
            try {
                String candidateName = user.getFirstName() + " " + user.getLastName();
                String title = "Hồ sơ ứng tuyển mới";
                String content = candidateName + " đã ứng tuyển vào vị trí " + job.getTitle();
                notificationService.createAndSendNotification(
                        job.getCreatedBy().getId(),
                        title,
                        content,
                        NotificationType.APPLICATION_STATUS_UPDATED,
                        application.getId().toString()
                );
            } catch (Exception e) {
                log.error("Failed to send notification to recruiter for new application", e);
            }
        }

        log.info("User {} applied for job {}", userId, job.getId());
        return applicationMapper.toSummaryResponse(application);
    }

    public void withdrawApplication(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        if (!application.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED, "Application does not belong to user");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
    }

    public ApplicationSummaryResponse updateStatus(UUID applicationId, UpdateApplicationStatusRequest request) {
        if (request == null || request.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Application status is required");
        }

        ApplicationStatus newStatus = request.getStatus();
        if (newStatus == ApplicationStatus.ACCEPTED) {
            if (request.getAcceptedStartDateTime() == null) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Accepted start date/time is required");
            }
            if (normalizeBlank(request.getAcceptedWorkAddress()) == null) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Accepted work address is required");
            }
        }

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        application.setStatus(newStatus);
        application = applicationRepository.save(application);

        notifyCandidateAfterStatusCommit(application, request);

        return applicationMapper.toSummaryResponse(application);
    }

    public ApplicationSummaryResponse scheduleInterview(UUID applicationId, ScheduleInterviewRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        application.setStatus(ApplicationStatus.PENDING_INTERVIEW_SCHEDULE);
        application.setInterviewDateTime(request.interviewDateTime());
        application.setInterviewLocation(normalizeBlank(request.interviewLocation()));
        application.setInterviewMeetingLink(normalizeBlank(request.interviewMeetingLink()));
        application.setInterviewNote(normalizeBlank(request.note()));
        application.setInterviewAcceptedAt(null);
        application.setCandidateInterviewResponseMessage(null);
        application.setCandidatePreferredInterviewDateTime(null);

        application = applicationRepository.save(application);

        notifyInterviewScheduleAfterCommit(application);

        return applicationMapper.toSummaryResponse(application);
    }

    public ApplicationSummaryResponse acceptInterviewSchedule(UUID userId, UUID applicationId) {
        Application application = findCandidateApplicationWaitingForSchedule(userId, applicationId);

        application.setStatus(ApplicationStatus.INTERVIEW);
        application.setInterviewAcceptedAt(Instant.now());
        application.setCandidateInterviewResponseMessage(null);
        application.setCandidatePreferredInterviewDateTime(null);

        return applicationMapper.toSummaryResponse(applicationRepository.save(application));
    }

    public ApplicationSummaryResponse changeInterviewSchedule(UUID userId, UUID applicationId, ChangeInterviewScheduleRequest request) {
        Application application = findCandidateApplicationWaitingForSchedule(userId, applicationId);

        application.setStatus(ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE);
        application.setInterviewAcceptedAt(null);
        application.setCandidatePreferredInterviewDateTime(request.candidatePreferredInterviewDateTime());
        application.setCandidateInterviewResponseMessage(normalizeBlank(request.reason()));

        return applicationMapper.toSummaryResponse(applicationRepository.save(application));
    }

    public ApplicationSummaryResponse acceptCandidateReschedule(UUID applicationId) {
        Application application = findApplicationWaitingForRescheduleReview(applicationId);

        application.setInterviewDateTime(application.getCandidatePreferredInterviewDateTime());
        application.setStatus(ApplicationStatus.INTERVIEW);
        application.setInterviewAcceptedAt(Instant.now());
        application.setCandidatePreferredInterviewDateTime(null);
        application.setCandidateInterviewResponseMessage(null);

        return applicationMapper.toSummaryResponse(applicationRepository.save(application));
    }

    public ApplicationSummaryResponse rejectCandidateReschedule(UUID applicationId) {
        Application application = findApplicationWaitingForRescheduleReview(applicationId);

        application.setStatus(ApplicationStatus.PENDING_INTERVIEW_SCHEDULE);
        application.setInterviewAcceptedAt(null);
        application.setCandidatePreferredInterviewDateTime(null);
        application.setCandidateInterviewResponseMessage(null);

        return applicationMapper.toSummaryResponse(applicationRepository.save(application));
    }

    private void notifyCandidateAfterStatusCommit(Application application, UpdateApplicationStatusRequest request) {
        Job job = application.getJob();
        String jobTitle = job == null ? null : job.getTitle();
        String companyName = job == null || job.getCompany() == null ? null : job.getCompany().getName();

        ApplicationStatusNotificationRequest notificationRequest = new ApplicationStatusNotificationRequest(
                application.getUser().getEmail(),
                buildFullName(application.getUser()),
                jobTitle,
                companyName,
                request.getStatus().name(),
                application.getId().toString(),
                null,
                null,
                null,
                null,
                null,
                null,
                request.getAcceptedStartDateTime(),
                normalizeBlank(request.getAcceptedWorkAddress()),
                normalizeBlank(request.getAcceptedNote())
        );

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notificationService.ApplicationStatusNotificationHandler(notificationRequest);
                }
            });
            return;
        }

        notificationService.ApplicationStatusNotificationHandler(notificationRequest);
    }

    private void notifyInterviewScheduleAfterCommit(Application application) {
        String actionLink = frontendBaseUrl + "/candidate/applied-jobs";

        ApplicationStatusNotificationRequest notificationRequest = new ApplicationStatusNotificationRequest(
                application.getUser().getEmail(),
                buildFullName(application.getUser()),
                application.getJob().getTitle(),
                application.getJob().getCompany() == null ? null : application.getJob().getCompany().getName(),
                ApplicationStatus.PENDING_INTERVIEW_SCHEDULE.name(),
                application.getId().toString(),
                application.getInterviewDateTime(),
                application.getInterviewLocation(),
                application.getInterviewMeetingLink(),
                application.getInterviewNote(),
                actionLink,
                "Phản hồi lịch phỏng vấn",
                null,
                null,
                null
        );

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notificationService.ApplicationStatusNotificationHandler(notificationRequest);
                }
            });
            return;
        }

        notificationService.ApplicationStatusNotificationHandler(notificationRequest);
    }

    private Application findCandidateApplicationWaitingForSchedule(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        if (!application.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Application does not belong to current candidate");
        }

        if (application.getStatus() != ApplicationStatus.PENDING_INTERVIEW_SCHEDULE) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Application is not waiting for interview schedule response");
        }

        if (application.getInterviewDateTime() == null) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Application does not have an interview schedule");
        }

        return application;
    }

    private Application findApplicationWaitingForRescheduleReview(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        if (application.getStatus() != ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Application is not waiting for reschedule review");
        }

        if (application.getCandidatePreferredInterviewDateTime() == null) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Application does not have a candidate preferred interview time");
        }

        return application;
    }

    private String normalizeBlank(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String lastName = user.getLastName() == null ? "" : user.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();

        if (!fullName.isBlank()) {
            return fullName;
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return user.getEmail();
    }
}
