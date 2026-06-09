package sba301.hrtech.job.validators;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import sba301.hrtech.auth.dtos.user.CustomUserDetails;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.abstractions.repositories.CompanyMemberRepository;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.company.entities.enums.CompanyPermission;
import sba301.hrtech.company.entities.enums.CompanyRole;
import sba301.hrtech.company.entities.enums.CompanyStatus;
import sba301.hrtech.company.services.CompanyPermissionService;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

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
        throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User is not authenticated");
    }

    public Company validateCompanyApproved(UUID companyId) {
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

    public void validateCanPostJob(User user, UUID companyId) {
        if (!permissionService.hasPermission(user.getId(), companyId, CompanyPermission.CREATE_JOB)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not have permission to post jobs in this company.");
        }
    }

    public void validateCanEditJob(User user, Job job) {
        UUID companyId = job.getCompany().getId();
        CompanyMember member = companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, user.getId())
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN,
                        ErrorCode.JOB_PERMISSION_DENIED,
                        "You do not belong to this company."));

        // HR can only edit jobs they created
        if (member.getCompanyRole() == CompanyRole.HR) {
            if (job.getCreatedBy() == null || !job.getCreatedBy().getId().equals(user.getId())) {
                throw new AppException(HttpStatus.FORBIDDEN,
                        ErrorCode.JOB_PERMISSION_DENIED,
                        "HR can only edit their own jobs.");
            }
        }

        if (!permissionService.hasPermission(user.getId(), companyId, CompanyPermission.UPDATE_JOB)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not have permission to update jobs in this company.");
        }
    }

    public void validateCanApproveJob(User user, UUID companyId) {
        if (!permissionService.hasPermission(user.getId(), companyId, CompanyPermission.APPROVE_JOB)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not have permission to approve/reject jobs in this company.");
        }
    }

    public void validateCanCloseJob(User user, UUID companyId) {
        // Close job permission requires DELETE_JOB or general managing privileges
        if (!permissionService.hasPermission(user.getId(), companyId, CompanyPermission.DELETE_JOB)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not have permission to close jobs in this company.");
        }
    }

    public void validateCanViewCompanyJobs(User user, UUID companyId) {
        if (!permissionService.hasPermission(user.getId(), companyId, CompanyPermission.VIEW_APPLICANTS)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not have permission to view jobs in this company.");
        }
    }

    public void validateJobOwnership(Job job, UUID userId) {
        if (job.getCreatedBy() == null || !job.getCreatedBy().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_NOT_OWNER,
                    "You can only modify jobs that you have created.");
        }
    }

    public Job getActiveJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId));
        if (job.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId);
        }
        return job;
    }
}
