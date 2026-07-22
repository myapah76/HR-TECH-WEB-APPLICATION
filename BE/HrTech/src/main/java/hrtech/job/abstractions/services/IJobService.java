package hrtech.job.abstractions.services;

import hrtech.job.dtos.response.HotPositionResponse;
import hrtech.job.dtos.response.TrendingSkillResponse;
import hrtech.job.dtos.response.LandingStatsResponse;
import hrtech.job.dtos.response.RecruiterJobStatsResponse;
import hrtech.job.dtos.response.RecruiterManageJobResponse;
import hrtech.job.entities.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.request.JobSearchCriteria;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobType;
import hrtech.job.entities.JobSkill;
import hrtech.shared.enums.ExtractionStatus;
import java.time.Instant;

import java.util.List;
import java.util.UUID;

public interface IJobService {
    JobResponse createJob(JobRequest request);

    JobResponse updateJob(UUID jobId, JobRequest request);

    JobResponse submitJob(UUID jobId);

    JobResponse closeJob(UUID jobId);

    void deleteJob(UUID jobId);

    JobResponse appealJob(UUID jobId, String appealReason);

    JobResponse approveAppeal(UUID jobId);

    JobResponse rejectAppeal(UUID jobId, String reason);

    JobResponse getJobDetails(UUID jobId);

    Page<JobResponse> searchJobs(JobSearchCriteria criteria, Pageable pageable);

    Page<JobResponse> listJobs(Pageable pageable);

    Page<JobResponse> getJobReport(String keyword, Pageable pageable);

    Page<JobResponse> getPublicCompanyJobs(UUID companyId, Pageable pageable);

    Page<RecruiterManageJobResponse> getManageCompanyJobs(
            UUID companyId, String keyword, JobStatus status, JobType jobType, ExperienceLevel jobLevel, Pageable pageable);

    JobResponse duplicateJob(UUID jobId);

    Job getJobEntityById(UUID jobId);

    List<Job> findStuckJobs(List<ExtractionStatus> statuses, Instant threshold);

    List<Job> getAllJobEntities();

    void saveJobEntity(Job job);

    void saveJobSkill(JobSkill jobSkill);

    List<TrendingSkillResponse> getTrendingSkills(int limit);

    List<HotPositionResponse> getHotPositions(int limit);

    LandingStatsResponse getLandingStats();

    List<Job> getJobsByCompanyId(UUID companyId);

    RecruiterJobStatsResponse getCompanyJobStats(UUID companyId);
}
