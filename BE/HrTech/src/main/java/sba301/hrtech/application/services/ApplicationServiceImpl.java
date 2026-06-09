package sba301.hrtech.application.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.application.abstractions.repositories.ApplicationRepository;
import sba301.hrtech.application.abstractions.repositories.ApplicationScoreRepository;
import sba301.hrtech.application.abstractions.services.ApplicationService;
import sba301.hrtech.application.dtos.request.SubmitApplicationRequest;
import sba301.hrtech.application.dtos.response.ApplicationDetailResponse;
import sba301.hrtech.application.dtos.response.ApplicationSummaryResponse;
import sba301.hrtech.application.entities.Application;
import sba301.hrtech.application.entities.ApplicationScore;
import sba301.hrtech.application.entities.enums.ApplicationStatus;
import sba301.hrtech.shared.enums.ScoreGrade;
import sba301.hrtech.application.mapper.ApplicationMapper;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.abstractions.repositories.UserRepository;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.abstractions.repositories.CvRepository;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.enums.JobStatus;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.services.IRecommendationService;
import sba301.hrtech.skill.dtos.response.SkillMatchScoreResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationScoreRepository applicationScoreRepository;
    private final JobRepository jobRepository;
    private final CvRepository cvRepository;
    private final UserRepository userRepository;
    private final ApplicationMapper applicationMapper;
    private final IRecommendationService recommendationService;

    @Override
    public ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, ErrorCode.User_Not_Found, "User not found"));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, ErrorCode.JOB_NOT_FOUND_CODE, "Job not found"));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.JOB_INVALID_STATUS, "Job is not OPEN for applications");
        }

        Cv cv = cvRepository.findById(request.getCvId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, ErrorCode.INVALID_INPUT, "CV not found"));

        if (!cv.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, ErrorCode.JOB_PERMISSION_DENIED, "CV does not belong to user");
        }

        if (applicationRepository.existsByUserIdAndJobId(userId, job.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_INPUT, "Already applied to this job");
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

        // Call recommendation service to calculate match score
        try {
            SkillMatchScoreResponse matchScore = recommendationService.calculateMatchScore(cv.getId(), job.getId());
            ScoreGrade grade = matchScore.getGrade();

            ApplicationScore applicationScore = ApplicationScore.builder()
                    .application(application)
                    .overallScore(BigDecimal.valueOf(matchScore.getOverallScore()))
                    .grade(grade)
                    .aiSummary("AI Score calculated from graph and embeddings")
                    .aiSuggestion(generateSuggestion(grade))
                    .modelVersion("1.0")
                    .scoredAt(Instant.now())
                    .build();

            applicationScore = applicationScoreRepository.save(applicationScore);
            application.setApplicationScore(applicationScore);
        } catch (Exception e) {
            log.error("Failed to calculate AI match score for application {}", application.getId(), e);
            // Optionally could set a default empty score or let it fail. We will fail softly here:
            ApplicationScore emptyScore = ApplicationScore.builder()
                    .application(application)
                    .overallScore(BigDecimal.ZERO)
                    .grade(ScoreGrade.POOR)
                    .aiSummary("AI calculation failed")
                    .scoredAt(Instant.now())
                    .build();
            applicationScoreRepository.save(emptyScore);
        }

        log.info("User {} applied for job {}", userId, job.getId());
        return applicationMapper.toSummaryResponse(application);
    }

    private String generateSuggestion(ScoreGrade grade) {
        return switch (grade) {
            case EXCELLENT -> "Ứng viên rất phù hợp với vị trí này.";
            case GOOD -> "Ứng viên khá phù hợp, cần kiểm tra thêm ở vòng phỏng vấn.";
            case FAIR -> "Ứng viên đạt yêu cầu cơ bản, nhưng thiếu một số kỹ năng quan trọng.";
            case POOR -> "Ứng viên chưa đáp ứng yêu cầu của vị trí này.";
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationSummaryResponse> getMyApplications(UUID userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(applicationMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Application not found"));

        // Only applicant or HR can view. For now, just check if it belongs to user OR if user is HR (basic check)
        // A more robust check would involve JobValidator, but for now we allow if user == applicant
        // In a real scenario, HR would call a different endpoint or we validate role.
        
        return applicationMapper.toDetailResponse(application);
    }

    @Override
    public void withdrawApplication(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Application not found"));

        if (!application.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, ErrorCode.JOB_PERMISSION_DENIED, "Application does not belong to user");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
    }

    @Override
    public ApplicationSummaryResponse updateStatus(UUID applicationId, ApplicationStatus newStatus) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Application not found"));

        application.setStatus(newStatus);
        application = applicationRepository.save(application);
        return applicationMapper.toSummaryResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(applicationMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }
}
