package hrtech.job.services;

import hrtech.job.abstractions.services.IJobService;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.request.JobSearchCriteria;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.dtos.response.HotPositionResponse;
import hrtech.job.dtos.response.TrendingSkillResponse;
import hrtech.job.dtos.response.LandingStatsResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.entities.enums.JobType;
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
    public JobResponse updateJob(UUID jobId, JobRequest request) {
        return commandService.updateJob(jobId, request);
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
    public JobResponse appealJob(UUID jobId) {
        return commandService.appealJob(jobId);
    }

    @Override
    public JobResponse approveAppeal(UUID jobId) {
        return commandService.approveAppeal(jobId);
    }

    @Override
    public JobResponse rejectAppeal(UUID jobId) {
        return commandService.rejectAppeal(jobId);
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
    public Page<JobResponse> getJobReport(String keyword, Pageable pageable) {
        return queryService.getJobReport(keyword, pageable);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getPublicCompanyJobs(UUID companyId, Pageable pageable) {
        return queryService.getPublicCompanyJobs(companyId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getManageCompanyJobs(
            UUID companyId, JobStatus status, JobType jobType, ExperienceLevel jobLevel, Pageable pageable) {
        return queryService.getManageCompanyJobs(companyId, status, jobType, jobLevel, pageable);
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
