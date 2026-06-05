package sba301.hrtech.job.abstractions.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sba301.hrtech.job.dtos.request.JobRequest;
import sba301.hrtech.job.dtos.request.JobSearchCriteria;
import sba301.hrtech.job.dtos.response.JobResponse;

import java.util.List;
import java.util.UUID;

public interface IJobService {

    /** HR creates a new job in DRAFT status */
    JobResponse createJob(JobRequest request);

    /** HR updates their own DRAFT job */
    JobResponse updateOwnJob(UUID jobId, JobRequest request);

    /** HR submits their DRAFT job for approval (DRAFT -> PENDING) */
    JobResponse submitJob(UUID jobId);

    /** HR_MANAGER approves a PENDING job (PENDING -> OPEN) */
    JobResponse approveJob(UUID jobId);

    /** HR_MANAGER rejects a PENDING job (PENDING -> DRAFT) */
    JobResponse rejectJob(UUID jobId);

    /** OWNER or HR_MANAGER closes an OPEN job (OPEN -> CLOSED) */
    JobResponse closeJob(UUID jobId);

    /** System Admin force-deletes (soft) any job */
    void adminDeleteJob(UUID jobId);

    /** Get a single job's details (respects visibility rules) */
    JobResponse getJobDetails(UUID jobId);

    /** Public search - only returns OPEN jobs */
    Page<JobResponse> searchJobs(JobSearchCriteria criteria, Pageable pageable);

    /** HR Manager / Owner: view all jobs in their company */
    List<JobResponse> getCompanyJobs(UUID companyId);

    /** HR Manager: view all PENDING jobs awaiting approval */
    List<JobResponse> getPendingJobs(UUID companyId);

    /** HR: view their own jobs in a company */
    List<JobResponse> getMyJobs(UUID companyId);
}
