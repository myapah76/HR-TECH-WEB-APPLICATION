package sba301.hrtech.job.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.dtos.request.JobRequest;
import sba301.hrtech.job.dtos.request.JobSearchCriteria;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobSkill;
import sba301.hrtech.job.entities.enums.ExperienceLevel;
import sba301.hrtech.job.entities.enums.JobStatus;
import sba301.hrtech.job.entities.enums.JobType;
import sba301.hrtech.job.mapper.JobMapper;
import sba301.hrtech.job.validators.JobValidator;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.enums.ExtractionStatus;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements IJobService {

    private final JobRepository jobRepository;
    private final ISkillExtractionService skillExtractionService;
    private final JobMapper jobMapper;
    private final JobValidator jobValidator;

    @Override
    @Transactional
    public JobResponse createJob(JobRequest request) {
        User currentUser = jobValidator.getCurrentUser();
        Company company = jobValidator.validateCompanyApproved(request.companyId());
        jobValidator.validateCompanyAccess(currentUser, company.getId());
        jobValidator.validateHrRole(currentUser);

        Job job = Job.builder()
                .company(company)
                .createdBy(currentUser)
                .status(JobStatus.DRAFT)
                .jobSkills(new ArrayList<>())
                .build();
        jobMapper.applyJobFields(job, request);

        Job savedJob = jobRepository.save(job);

        // Build and save skills
        List<JobSkill> skills = jobMapper.buildJobSkills(savedJob, request.skills());
        savedJob.getJobSkills().addAll(skills);
        savedJob.setExtractionStatus(ExtractionStatus.PENDING);
        savedJob = jobRepository.save(savedJob);

        final UUID finalJobId = savedJob.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                skillExtractionService.extractAndSaveJobSkills(finalJobId);
            }
        });

        log.info("HR {} created job '{}' for company {}", currentUser.getId(), savedJob.getTitle(), company.getId());
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse updateOwnJob(UUID jobId, JobRequest request) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCompanyAccess(currentUser, job.getCompany().getId());
        jobValidator.validateJobOwnership(job, currentUser.getId());

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be edited. Current status: " + job.getStatus());
        }

        jobMapper.applyJobFields(job, request);

        // Replace skills
        job.getJobSkills().clear();
        List<JobSkill> newSkills = jobMapper.buildJobSkills(job, request.skills());
        job.getJobSkills().addAll(newSkills);

        job.setExtractionStatus(ExtractionStatus.PENDING);
        Job updatedJob = jobRepository.save(job);

        final UUID finalUpdatedJobId = updatedJob.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                skillExtractionService.extractAndSaveJobSkills(finalUpdatedJobId);
            }
        });
        log.info("HR {} updated job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(updatedJob);
    }

    @Override
    @Transactional
    public JobResponse submitJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCompanyAccess(currentUser, job.getCompany().getId());
        jobValidator.validateJobOwnership(job, currentUser.getId());

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be submitted. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.PENDING);
        Job savedJob = jobRepository.save(job);
        log.info("HR {} submitted job {} for approval", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse approveJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCompanyAccess(currentUser, job.getCompany().getId());
        jobValidator.validateManagerRole(currentUser);

        if (job.getStatus() != JobStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING jobs can be approved. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.OPEN);
        Job savedJob = jobRepository.save(job);
        log.info("HR_MANAGER {} approved job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse rejectJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCompanyAccess(currentUser, job.getCompany().getId());
        jobValidator.validateManagerRole(currentUser);

        if (job.getStatus() != JobStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING jobs can be rejected. Current status: " + job.getStatus());
        }

        // Return to DRAFT for corrections
        job.setStatus(JobStatus.DRAFT);
        Job savedJob = jobRepository.save(job);
        log.info("HR_MANAGER {} rejected job {} (returned to DRAFT)", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse closeJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCompanyAccess(currentUser, job.getCompany().getId());
        jobValidator.validateOwnerOrManagerRole(currentUser);

        if (job.getStatus() != JobStatus.OPEN) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only OPEN jobs can be closed. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.CLOSED);
        Job savedJob = jobRepository.save(job);
        log.info("User {} ({}) closed job {}", currentUser.getId(), currentUser.getRole().getName(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public void adminDeleteJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId));
        job.setDeleted(true);
        jobRepository.save(job);
        log.warn("Admin soft-deleted job {}", jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobDetails(UUID jobId) {
        Job job = jobValidator.getActiveJob(jobId);
        return jobMapper.toResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(JobSearchCriteria criteria, Pageable pageable) {
        ExperienceLevel expLevel = null;
        JobType jobType = null;

        if (criteria.experienceLevel() != null) {
            try { expLevel = ExperienceLevel.valueOf(criteria.experienceLevel()); }
            catch (IllegalArgumentException ignored) {}
        }
        if (criteria.jobType() != null) {
            try { jobType = JobType.valueOf(criteria.jobType()); }
            catch (IllegalArgumentException ignored) {}
        }

        return jobRepository.searchOpenJobs(
                criteria.keyword(),
                criteria.location(),
                expLevel,
                jobType,
                criteria.salaryMin(),
                criteria.salaryMax(),
                pageable
        ).map(jobMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getCompanyJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCompanyAccess(currentUser, companyId);
        jobValidator.validateOwnerOrManagerRole(currentUser);

        return jobRepository.findByCompanyIdAndDeletedFalse(companyId)
                .stream().map(jobMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getPendingJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCompanyAccess(currentUser, companyId);
        jobValidator.validateManagerRole(currentUser);

        return jobRepository.findByCompanyIdAndStatusAndDeletedFalse(companyId, JobStatus.PENDING)
                .stream().map(jobMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCompanyAccess(currentUser, companyId);
        jobValidator.validateHrRole(currentUser);

        return jobRepository.findByCompanyIdAndCreatedByIdAndDeletedFalse(companyId, currentUser.getId())
                .stream().map(jobMapper::toResponse).collect(Collectors.toList());
    }
}
