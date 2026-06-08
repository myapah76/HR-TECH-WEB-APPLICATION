package sba301.hrtech.job.validators;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.company.entities.enums.CompanyStatus;
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

    public void validateCompanyAccess(User user, UUID companyId) {
        if (user.getCompany() == null || !user.getCompany().getId().equals(companyId)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "You do not belong to this company.");
        }
    }

    public void validateHrRole(User user) {
        if (user.getRole() == null || !"HR".equals(user.getRole().getName())) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "Only HR staff can perform this action.");
        }
    }

    public void validateManagerRole(User user) {
        if (user.getRole() == null || !"HR_MANAGER".equals(user.getRole().getName())) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "Only HR Manager can perform this action.");
        }
    }

    public void validateOwnerOrManagerRole(User user) {
        if (user.getRole() == null) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "Only Owner or HR Manager can perform this action.");
        }
        String roleName = user.getRole().getName();
        if (!"COMPANY_OWNER".equals(roleName) && !"HR_MANAGER".equals(roleName)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "Only Owner or HR Manager can perform this action.");
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
