package hrtech.job.services;

import hrtech.job.abstractions.services.IJobService;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.request.JobSearchCriteria;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.dtos.response.HotPositionResponse;
import hrtech.job.dtos.response.TrendingSkillResponse;
import hrtech.job.dtos.response.LandingStatsResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.JobSkill;
import hrtech.shared.enums.ExtractionStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class JobServiceImpl implements IJobService {

    private final JobQueryService queryService;
    private final JobCommandService commandService;
    private final JobAnalyticsService analyticsService;

    @Override
    public JobResponse createJob(JobRequest request) {
        return commandService.createJob(request);
    }

    @Override
    public JobResponse updateOwnJob(UUID jobId, JobRequest request) {
        return commandService.updateOwnJob(jobId, request);
    }

    @Override
    public JobResponse submitJob(UUID jobId) {
        return commandService.submitJob(jobId);
    }

    @Override
    public JobResponse approveJob(UUID jobId) {
        return commandService.approveJob(jobId);
    }

    @Override
    public JobResponse rejectJob(UUID jobId) {
        return commandService.rejectJob(jobId);
    }

    @Override
    public JobResponse closeJob(UUID jobId) {
        return commandService.closeJob(jobId);
    }

    @Override
    public void adminDeleteJob(UUID jobId) {
        commandService.adminDeleteJob(jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobDetails(UUID jobId) {
        return queryService.getJobDetails(jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(JobSearchCriteria criteria, Pageable pageable) {
        return queryService.searchJobs(criteria, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> listJobs(Pageable pageable) {
        return queryService.listJobs(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getJobsForAdmin(String keyword, String status, Pageable pageable) {
        return queryService.getJobsForAdmin(keyword, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getCompanyJobs(UUID companyId) {
        return queryService.getCompanyJobs(companyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getManageJobs(UUID companyId) {
        return queryService.getManageJobs(companyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getPendingJobs(UUID companyId) {
        return queryService.getPendingJobs(companyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(UUID companyId) {
        return queryService.getMyJobs(companyId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getCompanyJobsWithFilters(UUID companyId, String status, String jobType, String jobLevel,
            Pageable pageable) {
        return queryService.getCompanyJobsWithFilters(companyId, status, jobType, jobLevel, pageable);
    }

    @Override
    public Job getJobEntityById(UUID jobId) {
        return queryService.getJobEntityById(jobId);
    }

    @Override
    public List<Job> findStuckJobs(List<ExtractionStatus> statuses, Instant threshold) {
        return queryService.findStuckJobs(statuses, threshold);
    }

    @Override
    public List<Job> getAllJobEntities() {
        return queryService.getAllJobEntities();
    }

    @Override
    public void saveJobEntity(Job job) {
        commandService.saveJobEntity(job);
    }

    @Override
    public void saveJobSkill(JobSkill jobSkill) {
        commandService.saveJobSkill(jobSkill);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrendingSkillResponse> getTrendingSkills(int limit) {
        return analyticsService.getTrendingSkills(limit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotPositionResponse> getHotPositions(int limit) {
        return analyticsService.getHotPositions(limit);
    }

    @Override
    @Transactional(readOnly = true)
    public LandingStatsResponse getLandingStats() {
        return analyticsService.getLandingStats();
    }
}
