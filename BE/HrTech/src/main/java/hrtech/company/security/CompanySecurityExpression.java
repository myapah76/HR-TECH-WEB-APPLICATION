package hrtech.company.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import hrtech.application.abstractions.repositories.ApplicationRepository;
import hrtech.application.entities.Application;
import hrtech.company.abstractions.repositories.CompanyMemberRepository;
import hrtech.company.entities.enums.CompanyRole;
import hrtech.identity.dtos.user.CustomUserDetails;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.entities.Job;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component("companySecurity")
@RequiredArgsConstructor
public class CompanySecurityExpression {

    private final CompanyMemberRepository companyMemberRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    /**
     * Checks if the currently authenticated user has ANY of the provided roles in the specified company.
     * @param companyId The ID of the company
     * @param roles     The roles to check (passed as Strings to simplify @PreAuthorize expressions)
     * @return true if the user has at least one of the required roles in the company
     */
    public boolean hasRole(Object companyId, String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UUID currentUserId = userDetails.user().getId();
            UUID targetCompanyId = UUID.fromString(companyId.toString());

            List<CompanyRole> requiredRoles = Arrays.stream(roles)
                    .map(CompanyRole::valueOf)
                    .collect(Collectors.toList());

            return companyMemberRepository.existsByCompanyIdAndUserIdAndCompanyRoleInAndDeletedFalse(
                    targetCompanyId, currentUserId, requiredRoles);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Helper to check if the user is the OWNER of the company.
     */
    public boolean isOwner(Object companyId) {
        return hasRole(companyId, "OWNER");
    }

    /**
     * Helper to check if the user is either the OWNER or HR_MANAGER.
     */
    public boolean isOwnerOrManager(Object companyId) {
        return hasRole(companyId, "OWNER", "HR_MANAGER");
    }

    /**
     * Helper to check if the user is a member of the company (ANY role).
     */
    public boolean isMember(Object companyId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UUID currentUserId = userDetails.user().getId();
            UUID targetCompanyId = UUID.fromString(companyId.toString());

            // We can just use the repository directly to check if they exist in the company at all
            return companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(targetCompanyId, currentUserId).isPresent();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Checks if the currently authenticated user has the required roles for the company that owns the specified job.
     */
    public boolean hasJobRole(Object jobId, String... roles) {
        if (jobId == null) return false;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                if (userDetails.user().getRole() != null && "ADMIN_SYSTEM".equals(userDetails.user().getRole().getName())) {
                    return true;
                }
            }
            Job job = jobRepository.findById(UUID.fromString(jobId.toString())).orElse(null);
            if (job == null || job.getCompany() == null) {
                return false;
            }
            return hasRole(job.getCompany().getId(), roles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isJobOwnerOrManager(Object jobId) {
        return hasJobRole(jobId, "OWNER", "HR_MANAGER");
    }

    public boolean isJobManager(Object jobId) {
        return hasJobRole(jobId, "HR_MANAGER");
    }

    public boolean isJobCreatorOrManager(Object jobId) {
        if (jobId == null) return false;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getPrincipal())) {
                return false;
            }

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Job job = jobRepository.findById(UUID.fromString(jobId.toString())).orElse(null);
            if (job == null || job.getCompany() == null) {
                return false;
            }

            boolean isCreator = job.getCreatedBy() != null
                    && job.getCreatedBy().getId().equals(userDetails.user().getId());
            return isCreator || hasRole(job.getCompany().getId(), "HR_MANAGER");
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isJobCreatorOrHr(Object jobId) {
        if (jobId == null) return false;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getPrincipal())) {
                return false;
            }

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Job job = jobRepository.findById(UUID.fromString(jobId.toString())).orElse(null);
            if (job == null || job.getCompany() == null) {
                return false;
            }

            boolean isCreator = job.getCreatedBy() != null
                    && job.getCreatedBy().getId().equals(userDetails.user().getId());
            return isCreator || hasRole(job.getCompany().getId(), "HR");
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isJobMember(Object jobId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }
        try {
            Job job = jobRepository.findById(UUID.fromString(jobId.toString())).orElse(null);
            if (job == null || job.getCompany() == null) {
                return false;
            }
            return isMember(job.getCompany().getId());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Checks if the currently authenticated user has the required roles for the company that owns the application.
     */
    public boolean hasApplicationRole(Object applicationId, String... roles) {
        if (applicationId == null) return false;
        try {
            Application app = applicationRepository.findById(UUID.fromString(applicationId.toString())).orElse(null);
            if (app == null || app.getJob() == null) {
                return false;
            }
            return hasJobRole(app.getJob().getId(), roles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isApplicationOwnerOrManagerOrHr(Object applicationId) {
        return hasApplicationRole(applicationId, "OWNER", "HR_MANAGER", "HR");
    }
}
