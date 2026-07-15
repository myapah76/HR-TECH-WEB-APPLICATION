package hrtech.application.services;

import hrtech.application.abstractions.repositories.ApplicationRepository;
import hrtech.application.dtos.response.ApplicationDetailResponse;
import hrtech.application.dtos.response.ApplicationSummaryResponse;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.application.mapper.ApplicationMapper;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ApplicationQueryService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;
    private final ICompanyService companyService;

    public Page<ApplicationSummaryResponse> getMyApplications(UUID userId, Pageable pageable) {
        return applicationRepository.findByUserId(userId, pageable)
                .map(applicationMapper::toSummaryResponse);
    }

    public ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        boolean isApplicant = application.getUser().getId().equals(userId);
        boolean isCompanyMember = application.getJob() != null
                && application.getJob().getCompany() != null
                && companyService.getMemberByCompanyIdAndUserId(
                        application.getJob().getCompany().getId(), userId).isPresent();

        if (!isApplicant && !isCompanyMember) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to view this application");
        }

        return applicationMapper.toDetailResponse(application);
    }

    public Page<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId, Pageable pageable) {
        return applicationRepository.findByJobId(jobId, pageable)
                .map(applicationMapper::toSummaryResponse);
    }

    public boolean hasApplied(UUID userId, UUID jobId) {
        return applicationRepository.existsByUserIdAndJobIdAndStatusNotIn(
                userId,
                jobId,
                List.of(ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));
    }

    public long countApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.countByStatus(status);
    }

    public long countApplicationsByUserId(UUID userId) {
        return applicationRepository.countByUserId(userId);
    }

    public long countApplicationsByUserIdAndStatus(UUID userId, ApplicationStatus status) {
        return applicationRepository.countByUserIdAndStatus(userId, status);
    }

    public List<Application> getRecentApplications(UUID userId, int limit) {
        return applicationRepository.findByUserIdOrderByAppliedAtDesc(userId,
                PageRequest.of(0, limit));
    }

    public List<Application> getUpcomingInterviews(UUID userId) {
        return applicationRepository.findByUserIdAndStatusAndInterviewDateTimeGreaterThanEqualOrderByInterviewDateTimeAsc(
                userId, ApplicationStatus.INTERVIEW, Instant.now());
    }
}
