package hrtech.job.services;

import com.querydsl.core.BooleanBuilder;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.company.entities.CompanyMember;
import hrtech.identity.dtos.user.CustomUserDetails;
import hrtech.identity.entities.User;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.dtos.request.JobSearchCriteria;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.QJob;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.entities.enums.JobType;
import hrtech.job.mapper.JobMapper;
import hrtech.job.validators.JobValidator;
import hrtech.shared.enums.ExtractionStatus;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.skill.abstractions.services.ISkillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class JobQueryService {

    private final ICompanyService companyService;
    private final JobValidator jobValidator;
    private final ISkillService skillService;

    private final JobRepository jobRepository;

    private final JobMapper jobMapper;

    public JobResponse getJobDetails(UUID jobId) {
        Job job = jobValidator.getActiveJob(jobId);
        return jobMapper.toResponse(job);
    }

    public Page<JobResponse> searchJobs(JobSearchCriteria criteria, Pageable pageable) {
        QJob qJob = QJob.job;
        BooleanBuilder builder = new BooleanBuilder();

        builder.and(qJob.deleted.isFalse());
        builder.and(qJob.status.eq(JobStatus.APPROVED));

        if (criteria.keyword() != null && !criteria.keyword().trim().isEmpty()) {
            builder.and(buildKeywordPredicate(criteria.keyword().trim(), qJob));
        }

        if (criteria.location() != null && !criteria.location().isEmpty()) {
            builder.and(qJob.location.containsIgnoreCase(criteria.location().trim()));
        }

        if (criteria.jobType() != null) {
            builder.and(qJob.jobType.eq(criteria.jobType()));
        }

        if (criteria.experienceLevel() != null) {
            builder.and(qJob.experienceLevel.eq(criteria.experienceLevel()));
        }

        if (criteria.salaryMin() != null) {
            builder.and(qJob.salaryMax.goe(criteria.salaryMin()));
        }
        if (criteria.salaryMax() != null) {
            builder.and(qJob.salaryMin.loe(criteria.salaryMax()));
        }

        if (criteria.skills() != null && !criteria.skills().isEmpty()) {
            for (String skillName : criteria.skills()) {
                skillService.getSkillByName(skillName)
                        .map(skillNode -> skillNode.getId())
                        .ifPresent(skillId -> builder.and(qJob.jobSkills.any().skillNeo4jId.eq(skillId)));
            }
        }

        Page<Job> jobPage = jobRepository.findAll(builder, pageable);
        jobMapper.preloadSkillNames(jobPage.getContent());
        return jobPage.map(jobMapper::toResponse);
    }

    public Page<JobResponse> listJobs(Pageable pageable) {
        Page<Job> page = jobRepository.findByStatus(JobStatus.APPROVED, pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(jobMapper::toResponse);
    }

    public Page<JobResponse> getJobsForAdmin(String keyword, String status, Pageable pageable) {
        String keywordParam = (keyword != null && !keyword.trim().isEmpty()) ? "%" + keyword.trim().toLowerCase() + "%"
                : null;

        JobStatus jobStatusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                jobStatusEnum = JobStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        Page<Job> page = jobRepository.findAllJobsForAdmin(keywordParam, jobStatusEnum, pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(jobMapper::toResponse);
    }

    public List<JobResponse> getCompanyJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCanViewCompanyJobs(currentUser, companyId);

        return jobRepository.findByCompanyIdAndDeletedFalse(companyId).stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    public List<JobResponse> getManageJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        CompanyMember member = companyService.getMemberByCompanyIdAndUserId(companyId, currentUser.getId())
                .orElseThrow(() -> new AppException(
                        ErrorCode.JOB_PERMISSION_DENIED,
                        "You do not belong to this company."));

        return switch (member.getCompanyRole()) {
            case HR -> getMyJobs(companyId);
            case OWNER, HR_MANAGER -> getCompanyJobs(companyId);
        };
    }

    public List<JobResponse> getPendingJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCanApproveJob(currentUser, companyId);

        return jobRepository.findByCompanyIdAndStatusAndDeletedFalse(companyId, JobStatus.PENDING_APPROVAL)
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    public List<JobResponse> getMyJobs(UUID companyId) {
        User currentUser = jobValidator.getCurrentUser();
        jobValidator.validateCompanyApproved(companyId);
        jobValidator.validateCanPostJob(currentUser, companyId);

        return jobRepository.findByCompanyIdAndCreatedByIdAndDeletedFalse(companyId, currentUser.getId())
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    public Page<JobResponse> getCompanyJobsWithFilters(UUID companyId, String status, String jobType, String jobLevel,
            Pageable pageable) {
        jobValidator.validateCompanyApproved(companyId);

        Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;
        User currentUser = (principal instanceof CustomUserDetails(User user)) ? user : null;

        String targetStatus = status;
        if (!jobValidator.hasViewCompanyJobsPermission(currentUser, companyId)) {
            targetStatus = "APPROVED";
        }

        JobStatus jobStatusEnum = null;
        if (targetStatus != null) {
            try {
                jobStatusEnum = JobStatus.valueOf(targetStatus.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        JobType jobTypeEnum = null;
        if (jobType != null) {
            try {
                jobTypeEnum = JobType.valueOf(jobType.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        ExperienceLevel jobLevelEnum = null;
        if (jobLevel != null) {
            try {
                jobLevelEnum = ExperienceLevel.valueOf(jobLevel.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        Page<Job> page = jobRepository.findCompanyJobsWithFilters(companyId, jobStatusEnum, jobTypeEnum, jobLevelEnum,
                pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(jobMapper::toResponse);
    }

    public Job getJobEntityById(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND_CODE));
    }

    public List<Job> findStuckJobs(List<ExtractionStatus> statuses, Instant threshold) {
        return jobRepository.findStuckJobs(statuses, threshold);
    }

    public List<Job> getAllJobEntities() {
        return jobRepository.findAll();
    }

    private BooleanBuilder buildKeywordPredicate(String trimmedKeyword, QJob qJob) {
        BooleanBuilder keywordBuilder = new BooleanBuilder();
        String trimmedLower = trimmedKeyword.toLowerCase();
        String normalizedRole = skillService.resolveCanonicalRole(trimmedLower);
        Set<String> skillIds = new HashSet<>();
        List<String> idsByRole = skillService.getSkillIdsByRole(normalizedRole);
        if (idsByRole != null)
            skillIds.addAll(idsByRole);

        List<String> idsByName = skillService.getSkillIdsByNameContaining(trimmedLower);
        if (idsByName != null)
            skillIds.addAll(idsByName);

        keywordBuilder.or(qJob.title.toLowerCase().contains(trimmedLower))
                .or(qJob.description.toLowerCase().contains(trimmedLower))
                .or(qJob.company.name.toLowerCase().contains(trimmedLower))
                .or(qJob.position.toLowerCase().contains(trimmedLower));

        if (!skillIds.isEmpty()) {
            keywordBuilder.or(qJob.jobSkills.any().skillNeo4jId.in(skillIds));
        }
        return keywordBuilder;
    }
}
