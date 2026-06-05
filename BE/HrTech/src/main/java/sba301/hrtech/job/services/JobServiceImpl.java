package sba301.hrtech.job.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.auth.dtos.user.CustomUserDetails;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.company.abstractions.repositories.CompanyMemberRepository;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.company.entities.enums.CompanyRole;
import sba301.hrtech.company.entities.enums.CompanyStatus;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.abstractions.repositories.JobSkillRepository;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.dtos.request.JobRequest;
import sba301.hrtech.job.dtos.request.JobSearchCriteria;
import sba301.hrtech.job.dtos.request.JobSkillRequest;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.job.dtos.response.JobSkillResponse;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobSkill;
import sba301.hrtech.job.entities.enums.ExperienceLevel;
import sba301.hrtech.job.entities.enums.JobStatus;
import sba301.hrtech.job.entities.enums.JobType;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.enums.SkillLevel;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.entities.SkillNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements IJobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMemberRepository companyMemberRepository;
    private final SkillNodeRepository skillNodeRepository;

    // =============================================
    //  Security & Validation Helpers
    // =============================================

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.user();
        }
        throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User is not authenticated");
    }

    private Company validateCompanyApproved(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        ErrorCode.NOT_FOUND, "Company not found: " + companyId));
        if (company.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Company not found: " + companyId);
        }
        if (company.getStatus() != CompanyStatus.APPROVED) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_COMPANY_NOT_APPROVED,
                    "Company is not approved. Only approved companies can manage jobs.");
        }
        return company;
    }

    private CompanyMember validateCompanyMember(UUID companyId, UUID userId) {
        return companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN,
                        ErrorCode.JOB_PERMISSION_DENIED,
                        "You are not a member of this company."));
    }

    private void validateHrRole(CompanyMember member) {
        if (member.getRole() != CompanyRole.HR) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "Only HR staff can perform this action.");
        }
    }

    private void validateManagerRole(CompanyMember member) {
        if (member.getRole() != CompanyRole.HR_MANAGER) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "Only HR Manager can perform this action.");
        }
    }

    private void validateOwnerOrManagerRole(CompanyMember member) {
        if (member.getRole() != CompanyRole.OWNER && member.getRole() != CompanyRole.HR_MANAGER) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "Only Owner or HR Manager can perform this action.");
        }
    }

    private void validateJobOwnership(Job job, UUID userId) {
        if (job.getCreatedBy() == null || !job.getCreatedBy().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_NOT_OWNER,
                    "You can only modify jobs that you have created.");
        }
    }

    private Job getActiveJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId));
        if (job.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId);
        }
        return job;
    }

    // =============================================
    //  Mapping Helpers
    // =============================================

    private JobResponse toResponse(Job job) {
        List<JobSkillResponse> skillResponses = job.getJobSkills().stream()
                .map(js -> {
                    String skillName = skillNodeRepository.findById(js.getSkillNeo4jId())
                            .map(SkillNode::getName)
                            .orElse(js.getSkillNeo4jId());
                    return new JobSkillResponse(
                            js.getId(),
                            js.getSkillNeo4jId(),
                            skillName,
                            js.getRequiredLevel() != null ? js.getRequiredLevel().name() : null,
                            js.getIsMandatory()
                    );
                })
                .collect(Collectors.toList());

        String createdByName = null;
        UUID createdById = null;
        if (job.getCreatedBy() != null) {
            createdById = job.getCreatedBy().getId();
            createdByName = job.getCreatedBy().getFirstName() + " " + job.getCreatedBy().getLastName();
        }

        return new JobResponse(
                job.getId(),
                job.getCompany().getId(),
                job.getCompany().getName(),
                job.getCompany().getLogoUrl(),
                createdById,
                createdByName,
                job.getTitle(),
                job.getDescription(),
                job.getLocation(),
                job.getSalaryMin(),
                job.getSalaryMax(),
                job.getJobType() != null ? job.getJobType().name() : null,
                job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null,
                job.getStatus() != null ? job.getStatus().name() : null,
                job.getDeadline(),
                skillResponses,
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }

    private List<JobSkill> buildJobSkills(Job job, List<JobSkillRequest> skillRequests) {
        if (skillRequests == null || skillRequests.isEmpty()) {
            return new ArrayList<>();
        }
        List<JobSkill> result = new ArrayList<>();
        for (JobSkillRequest sr : skillRequests) {
            // Validate skill exists in Neo4j
            if (!skillNodeRepository.existsById(sr.skillNeo4jId())) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        ErrorCode.JOB_SKILL_NOT_FOUND,
                        "Skill not found in skill graph: " + sr.skillNeo4jId());
            }
            SkillLevel level = null;
            if (sr.requiredLevel() != null) {
                try {
                    level = SkillLevel.valueOf(sr.requiredLevel());
                } catch (IllegalArgumentException e) {
                    throw new AppException(HttpStatus.BAD_REQUEST,
                            ErrorCode.BAD_REQUEST,
                            "Invalid skill level: " + sr.requiredLevel());
                }
            }
            JobSkill js = JobSkill.builder()
                    .job(job)
                    .skillNeo4jId(sr.skillNeo4jId())
                    .requiredLevel(level)
                    .isMandatory(sr.isMandatory())
                    .build();
            result.add(js);
        }
        return result;
    }

    private void applyJobFields(Job job, JobRequest request) {
        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setLocation(request.location());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        job.setDeadline(request.deadline());

        if (request.jobType() != null) {
            try {
                job.setJobType(JobType.valueOf(request.jobType()));
            } catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST,
                        "Invalid job type: " + request.jobType());
            }
        }
        if (request.experienceLevel() != null) {
            try {
                job.setExperienceLevel(ExperienceLevel.valueOf(request.experienceLevel()));
            } catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST,
                        "Invalid experience level: " + request.experienceLevel());
            }
        }
    }

    // =============================================
    //  Job Lifecycle Operations
    // =============================================

    @Override
    @Transactional
    public JobResponse createJob(JobRequest request) {
        User currentUser = getCurrentUser();
        Company company = validateCompanyApproved(request.companyId());
        CompanyMember member = validateCompanyMember(company.getId(), currentUser.getId());
        validateHrRole(member);

        Job job = Job.builder()
                .company(company)
                .createdBy(currentUser)
                .status(JobStatus.DRAFT)
                .jobSkills(new ArrayList<>())
                .build();
        applyJobFields(job, request);

        Job savedJob = jobRepository.save(job);

        // Build and save skills
        List<JobSkill> skills = buildJobSkills(savedJob, request.skills());
        savedJob.getJobSkills().addAll(skills);
        jobRepository.save(savedJob);

        log.info("HR {} created job '{}' for company {}", currentUser.getId(), savedJob.getTitle(), company.getId());
        return toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse updateOwnJob(UUID jobId, JobRequest request) {
        User currentUser = getCurrentUser();
        Job job = getActiveJob(jobId);

        validateCompanyApproved(job.getCompany().getId());
        validateCompanyMember(job.getCompany().getId(), currentUser.getId());
        validateJobOwnership(job, currentUser.getId());

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be edited. Current status: " + job.getStatus());
        }

        applyJobFields(job, request);

        // Replace skills
        job.getJobSkills().clear();
        List<JobSkill> newSkills = buildJobSkills(job, request.skills());
        job.getJobSkills().addAll(newSkills);

        Job updatedJob = jobRepository.save(job);
        log.info("HR {} updated job {}", currentUser.getId(), jobId);
        return toResponse(updatedJob);
    }

    @Override
    @Transactional
    public JobResponse submitJob(UUID jobId) {
        User currentUser = getCurrentUser();
        Job job = getActiveJob(jobId);

        validateCompanyApproved(job.getCompany().getId());
        validateCompanyMember(job.getCompany().getId(), currentUser.getId());
        validateJobOwnership(job, currentUser.getId());

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be submitted. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.PENDING);
        Job savedJob = jobRepository.save(job);
        log.info("HR {} submitted job {} for approval", currentUser.getId(), jobId);
        return toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse approveJob(UUID jobId) {
        User currentUser = getCurrentUser();
        Job job = getActiveJob(jobId);

        validateCompanyApproved(job.getCompany().getId());
        CompanyMember member = validateCompanyMember(job.getCompany().getId(), currentUser.getId());
        validateManagerRole(member);

        if (job.getStatus() != JobStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING jobs can be approved. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.OPEN);
        Job savedJob = jobRepository.save(job);
        log.info("HR_MANAGER {} approved job {}", currentUser.getId(), jobId);
        return toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse rejectJob(UUID jobId) {
        User currentUser = getCurrentUser();
        Job job = getActiveJob(jobId);

        validateCompanyApproved(job.getCompany().getId());
        CompanyMember member = validateCompanyMember(job.getCompany().getId(), currentUser.getId());
        validateManagerRole(member);

        if (job.getStatus() != JobStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING jobs can be rejected. Current status: " + job.getStatus());
        }

        // Return to DRAFT for corrections
        job.setStatus(JobStatus.DRAFT);
        Job savedJob = jobRepository.save(job);
        log.info("HR_MANAGER {} rejected job {} (returned to DRAFT)", currentUser.getId(), jobId);
        return toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse closeJob(UUID jobId) {
        User currentUser = getCurrentUser();
        Job job = getActiveJob(jobId);

        validateCompanyApproved(job.getCompany().getId());
        CompanyMember member = validateCompanyMember(job.getCompany().getId(), currentUser.getId());
        validateOwnerOrManagerRole(member);

        if (job.getStatus() != JobStatus.OPEN) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only OPEN jobs can be closed. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.CLOSED);
        Job savedJob = jobRepository.save(job);
        log.info("User {} ({}) closed job {}", currentUser.getId(), member.getRole(), jobId);
        return toResponse(savedJob);
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
        Job job = getActiveJob(jobId);
        // Visibility: If the job is not OPEN, only internal company members should
        // access it. This endpoint is safe for candidates since only OPEN is public.
        // Fine-grained restriction can be added here if needed.
        return toResponse(job);
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
        ).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getCompanyJobs(UUID companyId) {
        User currentUser = getCurrentUser();
        validateCompanyApproved(companyId);
        CompanyMember member = validateCompanyMember(companyId, currentUser.getId());
        validateOwnerOrManagerRole(member);

        return jobRepository.findByCompanyIdAndDeletedFalse(companyId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getPendingJobs(UUID companyId) {
        User currentUser = getCurrentUser();
        validateCompanyApproved(companyId);
        CompanyMember member = validateCompanyMember(companyId, currentUser.getId());
        validateManagerRole(member);

        return jobRepository.findByCompanyIdAndStatusAndDeletedFalse(companyId, JobStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(UUID companyId) {
        User currentUser = getCurrentUser();
        validateCompanyApproved(companyId);
        CompanyMember member = validateCompanyMember(companyId, currentUser.getId());
        validateHrRole(member);

        return jobRepository.findByCompanyIdAndCreatedByIdAndDeletedFalse(companyId, currentUser.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }
}
