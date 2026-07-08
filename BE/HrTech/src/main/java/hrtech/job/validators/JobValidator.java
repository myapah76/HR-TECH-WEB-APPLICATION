package hrtech.job.validators;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import hrtech.identity.dtos.user.CustomUserDetails;
import hrtech.identity.entities.User;
import hrtech.company.abstractions.repositories.CompanyRepository;
import hrtech.company.abstractions.repositories.CompanyMemberRepository;
import hrtech.company.entities.Company;
import hrtech.company.entities.CompanyMember;
import hrtech.company.entities.enums.CompanyPermission;
import hrtech.company.entities.enums.CompanyRole;
import hrtech.company.entities.enums.CompanyStatus;
import hrtech.company.entities.enums.MembershipStatus;
import hrtech.company.services.CompanyPermissionService;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.entities.Job;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JobValidator {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMemberRepository companyMemberRepository;
    private final CompanyPermissionService permissionService;

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.user();
        }
        throw new AppException(ErrorCode.UNAUTHORIZED, "User is not authenticated");
    }

    public Company validateCompanyApproved(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Company not found: " + companyId));
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.NOT_FOUND, "Company not found: " + companyId);
        }
        if (company.getStatus() != CompanyStatus.APPROVED) {
            throw new AppException(ErrorCode.JOB_COMPANY_NOT_APPROVED,
                    "Company is not approved. Only approved companies can manage jobs.");
        }
        return company;
    }

    public void validateCanPostJob(User user, UUID companyId) {
        if (!permissionService.hasPermission(user.getId(), companyId, CompanyPermission.CREATE_JOB)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not have permission to post jobs in this company.");
        }
    }

    public void validateCanEditJob(User user, Job job) {
        UUID companyId = job.getCompany().getId();
        CompanyMember member = companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                        "You do not belong to this company."));

        // HR can only edit jobs they created
        if (member.getCompanyRole() == CompanyRole.HR) {
            if (job.getCreatedBy() == null || !job.getCreatedBy().getId().equals(user.getId())) {
                throw new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                        "HR can only edit their own jobs.");
            }
        }

        if (!permissionService.hasPermission(user.getId(), companyId, CompanyPermission.UPDATE_JOB)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not have permission to update jobs in this company.");
        }
    }

    public void validateCanApproveJob(User user, UUID companyId) {
        if (user.getRole() != null && "ADMIN_SYSTEM".equals(user.getRole().getName())) {
            return; // System admin bypass
        }
        CompanyMember member = getActiveCompanyMember(user, companyId);
        if (member.getCompanyRole() != CompanyRole.HR_MANAGER
                || !permissionService.hasPermission(user.getId(), companyId, CompanyPermission.APPROVE_JOB)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                    "Only HR managers can approve or reject jobs in this company.");
        }
    }

    public void validateCanSubmitJob(User user, Job job) {
        if (user.getRole() != null && "ADMIN_SYSTEM".equals(user.getRole().getName())) {
            return; // System admin bypass
        }
        CompanyMember member = getActiveCompanyMember(user, job.getCompany().getId());
        boolean isCreator = job.getCreatedBy() != null && job.getCreatedBy().getId().equals(user.getId());
        boolean isHr = member.getCompanyRole() == CompanyRole.HR;

        if (!isCreator && !isHr) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                    "Only the job creator or HR can submit this job.");
        }
    }

    public void validateCanCloseJob(User user, Job job) {
        if (user.getRole() != null && "ADMIN_SYSTEM".equals(user.getRole().getName())) {
            return; // System admin bypass
        }
        CompanyMember member = getActiveCompanyMember(user, job.getCompany().getId());
        boolean isCreator = job.getCreatedBy() != null && job.getCreatedBy().getId().equals(user.getId());
        boolean isManager = member.getCompanyRole() == CompanyRole.HR_MANAGER;

        if (!isCreator && !isManager) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                    "Only the job creator or an HR manager can close this job.");
        }
    }

    public void validateCanViewCompanyJobs(User user, UUID companyId) {
        if (!permissionService.hasPermission(user.getId(), companyId, CompanyPermission.VIEW_APPLICANTS)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not have permission to view jobs in this company.");
        }
    }

    public boolean hasViewCompanyJobsPermission(User user, UUID companyId) {
        if (user == null) return false;
        try {
            CompanyMember member = companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, user.getId())
                    .orElse(null);
            if (member == null || member.getMembershipStatus() != MembershipStatus.ACTIVE) {
                return false;
            }
            return permissionService.hasPermission(user.getId(), companyId, CompanyPermission.VIEW_APPLICANTS);
        } catch (Exception e) {
            return false;
        }
    }

    public void validateJobOwnership(Job job, UUID userId) {
        if (job.getCreatedBy() == null || !job.getCreatedBy().getId().equals(userId)) {
            throw new AppException(ErrorCode.JOB_NOT_OWNER,
                    "You can only modify jobs that you have created.");
        }
    }

    public Job getActiveJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId));
        if (job.isDeleted()) {
            throw new AppException(ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId);
        }
        return job;
    }

    private CompanyMember getActiveCompanyMember(User user, UUID companyId) {
        CompanyMember member = companyMemberRepository
                .findByCompanyIdAndUserIdAndDeletedFalse(companyId, user.getId())
                .orElseThrow(() -> new AppException(
                        ErrorCode.JOB_PERMISSION_DENIED,
                        "You do not belong to this company."));

        if (member.getMembershipStatus() != MembershipStatus.ACTIVE) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED,
                    "Your company membership is not active.");
        }

        return member;
    }
}
