package sba301.hrtech.job.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.company.abstractions.repositories.CompanyMemberRepository;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.abstractions.repositories.JobSkillRepository;
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
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.enums.ExtractionStatus;
import sba301.hrtech.shared.exceptions.AppException;
import org.springframework.context.ApplicationEventPublisher;
import sba301.hrtech.shared.events.JobExtractionRequestedEvent;
import sba301.hrtech.subscription.abstractions.services.ICreditService;
import sba301.hrtech.skill.abstractions.repositories.RoleAliasRepository;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.entities.RoleAlias;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements IJobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final CompanyMemberRepository companyMemberRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final JobMapper jobMapper;
    private final JobValidator jobValidator;
    private final ICreditService creditService;
    private final RoleAliasRepository roleAliasRepository;
    private final SkillNodeRepository skillNodeRepository;

    @Override
    @Transactional
    public JobResponse createJob(JobRequest request) {
        User currentUser = jobValidator.getCurrentUser();
        Company company = jobValidator.validateCompanyApproved(request.companyId());
        jobValidator.validateCanPostJob(currentUser, company.getId());

        // Deduct 1 Job Post Quota from the user's active subscription
        creditService.deductCompanyFeatureQuota(currentUser.getId(), "JOB_POSTING", 1);

        Job job = Job.builder()
                .company(company)
                .createdBy(currentUser)
                .status(JobStatus.DRAFT)
                .jobSkills(new ArrayList<>())
                .build();
        jobMapper.applyJobFields(job, request);

        Job savedJob = jobRepository.save(job);

        log.info("Recruiter {} created job '{}' for company {}", currentUser.getId(), savedJob.getTitle(),
                company.getId());
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse updateOwnJob(UUID jobId, JobRequest request) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanSubmitJob(currentUser, job);

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(
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

        log.info("Recruiter {} updated job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(updatedJob);
    }

    @Override
    @Transactional
    public JobResponse submitJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanEditJob(currentUser, job);

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be submitted. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.PENDING_APPROVAL);
        Job savedJob = jobRepository.save(job);
        log.info("Recruiter {} submitted job {} for approval", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse approveJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanApproveJob(currentUser, job.getCompany().getId());

        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be approved. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.APPROVED);
        Job savedJob = jobRepository.save(job);

        final UUID finalApproveJobId = savedJob.getId();
        eventPublisher.publishEvent(new JobExtractionRequestedEvent(finalApproveJobId));

        log.info("Approver {} approved job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse rejectJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanApproveJob(currentUser, job.getCompany().getId());

        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be rejected. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.REJECTED);
        Job savedJob = jobRepository.save(job);
        log.info("Approver {} rejected job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse closeJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanCloseJob(currentUser, job);

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Job is already CLOSED.");
        }

        job.setStatus(JobStatus.CLOSED);
        Job savedJob = jobRepository.save(job);
        log.info("User {} closed job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public void adminDeleteJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(
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
            try {
                expLevel = ExperienceLevel.valueOf(criteria.experienceLevel());
            } catch (IllegalArgumentException ignored) {
            }
        }
        if (criteria.jobType() != null) {
            try {
                jobType = JobType.valueOf(criteria.jobType());
            } catch (IllegalArgumentException ignored) {
            }
        }

        // 1. Normalize keyword using the database role_aliases table
        String keyword = criteria.keyword();
        String normalizedRole = null;
        if (keyword != null && !keyword.trim().isEmpty()) {
            String trimmedLower = keyword.trim().toLowerCase();
            normalizedRole = roleAliasRepository.findByAliasIgnoreCase(trimmedLower)
                    .map(RoleAlias::getCanonicalRole)
                    .orElse(trimmedLower);
        }

        // 2. Fetch skill IDs matching the normalized role or skill name
        Set<String> skillIds = new HashSet<>();
        if (normalizedRole != null) {
            // Find by role tag
            List<String> idsByRole = skillNodeRepository.findIdsByRole(normalizedRole);
            if (idsByRole != null) {
                skillIds.addAll(idsByRole);
            }
            // Find by skill name (substring match)
            List<String> idsByName = skillNodeRepository.findIdsByNameContaining(keyword.trim());
            if (idsByName != null) {
                skillIds.addAll(idsByName);
            }
        }

        boolean hasSkills = !skillIds.isEmpty();
        List<String> skillIdsList = hasSkills ? new ArrayList<>(skillIds) : null;

        String keywordParam = keyword != null && !keyword.trim().isEmpty() ? "%" + keyword.trim().toLowerCase() + "%" : null;
        String locationParam = criteria.location() != null && !criteria.location().trim().isEmpty() ? "%" + criteria.location().trim().toLowerCase() + "%" : null;

        return jobRepository.searchOpenJobs(
                keywordParam,
                locationParam,
                expLevel,
                jobType,
                criteria.salaryMin(),
                criteria.salaryMax(),
                hasSkills,
                skillIdsList,
                pageable).map(jobMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> listJobs(Pageable pageable) {
        return jobRepository.findByStatus(JobStatus.APPROVED, pageable)
                .map(jobMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getJobsForAdmin(String keyword, String status, Pageable pageable) {
        String keywordParam = (keyword != null && !keyword.trim().isEmpty()) ? "%" + keyword.trim().toLowerCase() + "%" : null;
        
        JobStatus jobStatusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                jobStatusEnum = JobStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        
        return jobRepository.findAllJobsForAdmin(keywordParam, jobStatusEnum, pageable)
                .map(jobMapper::toResponse);
    }
    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getCompanyJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCanViewCompanyJobs(currentUser, companyId);

        return jobRepository.findByCompanyIdAndDeletedFalse(companyId)
                .stream().map(jobMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getManageJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        CompanyMember member = companyMemberRepository
                .findByCompanyIdAndUserIdAndDeletedFalse(companyId, currentUser.getId())
                .orElseThrow(() -> new AppException(
                        ErrorCode.JOB_PERMISSION_DENIED,
                        "You do not belong to this company."));

        return switch (member.getCompanyRole()) {
            case HR -> getMyJobs(companyId);
            case OWNER, HR_MANAGER -> getCompanyJobs(companyId);
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getPendingJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCanApproveJob(currentUser, companyId);

        return jobRepository.findByCompanyIdAndStatusAndDeletedFalse(companyId, JobStatus.PENDING_APPROVAL)
                .stream().map(jobMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCanPostJob(currentUser, companyId);

        return jobRepository.findByCompanyIdAndCreatedByIdAndDeletedFalse(companyId, currentUser.getId())
                .stream().map(jobMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getCompanyJobsWithFilters(UUID companyId, String status, String jobType, String jobLevel, Pageable pageable) {
        jobValidator.validateCompanyApproved(companyId);

        Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;
        User currentUser = (principal instanceof CustomUserDetails userDetails) ? userDetails.user() : null;

        String targetStatus = status;
        if (!jobValidator.hasViewCompanyJobsPermission(currentUser, companyId)) {
            targetStatus = "APPROVED";
        }

        // Convert string status to enum if provided
        JobStatus jobStatusEnum = null;
        if (targetStatus != null) {
            try {
                jobStatusEnum = JobStatus.valueOf(targetStatus.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Invalid status, treat as null (no filter)
            }
        }

        // Convert string jobType to enum if provided
        JobType jobTypeEnum = null;
        if (jobType != null) {
            try {
                jobTypeEnum = JobType.valueOf(jobType.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Invalid jobType, treat as null (no filter)
            }
        }

        ExperienceLevel jobLevelEnum = null;
        if (jobLevel != null) {
            try {
                jobLevelEnum = ExperienceLevel.valueOf(jobLevel.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Invalid jobLevel, treat as null (no filter)
            }
        }
        return jobRepository.findCompanyJobsWithFilters(companyId, jobStatusEnum, jobTypeEnum, jobLevelEnum, pageable)
                .map(jobMapper::toResponse);
    }

    @Override
    public Job getJobEntityById(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND_CODE));
    }

    @Override
    public List<Job> findStuckJobs(List<ExtractionStatus> statuses, Instant threshold) {
        return jobRepository.findStuckJobs(statuses, threshold);
    }

    @Override
    public List<Job> getAllJobEntities() {
        return jobRepository.findAll();
    }

    @Override
    @Transactional
    public Job saveJobEntity(Job job) {
        return jobRepository.save(job);
    }

    @Override
    @Transactional
    public void saveJobSkill(JobSkill jobSkill) {
        jobSkillRepository.save(jobSkill);
    }
}
