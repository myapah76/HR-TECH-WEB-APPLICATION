package sba301.hrtech.job.abstractions.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sba301.hrtech.job.dtos.request.JobRequest;
import sba301.hrtech.job.dtos.request.JobSearchCriteria;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobSkill;
import sba301.hrtech.shared.enums.ExtractionStatus;
import java.time.Instant;

import java.util.List;
import java.util.UUID;

public interface IJobService {

    JobResponse createJob(JobRequest request);

    JobResponse updateOwnJob(UUID jobId, JobRequest request);

    JobResponse submitJob(UUID jobId);

    JobResponse approveJob(UUID jobId);

    JobResponse rejectJob(UUID jobId);

    JobResponse closeJob(UUID jobId);

    void adminDeleteJob(UUID jobId);

    JobResponse getJobDetails(UUID jobId);

    Page<JobResponse> searchJobs(JobSearchCriteria criteria, Pageable pageable);

    Page<JobResponse> listJobs(Pageable pageable);

    List<JobResponse> getCompanyJobs(UUID companyId);

    List<JobResponse> getManageJobs(UUID companyId);

    List<JobResponse> getPendingJobs(UUID companyId);

    List<JobResponse> getMyJobs(UUID companyId);

    Page<JobResponse> getCompanyJobsWithFilters(UUID companyId, String status, String jobType, Pageable pageable);

    Job getJobEntityById(UUID jobId);
    List<Job> findStuckJobs(List<ExtractionStatus> statuses, Instant threshold);
    List<Job> getAllJobEntities();
    Job saveJobEntity(Job job);
    void saveJobSkill(JobSkill jobSkill);
}
