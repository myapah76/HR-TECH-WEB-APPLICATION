package hrtech.job.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import hrtech.company.security.CompanySecurityExpression;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.entities.Job;
import hrtech.identity.dtos.user.CustomUserDetails;
import java.util.UUID;

@Component("jobSecurity")
@RequiredArgsConstructor
public class JobSecurityExpression {

    private final JobRepository jobRepository;
    private final CompanySecurityExpression companySecurity;

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
            return companySecurity.hasRole(job.getCompany().getId(), roles);
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
            return isCreator || companySecurity.hasRole(job.getCompany().getId(), "HR_MANAGER");
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
            return isCreator || companySecurity.hasRole(job.getCompany().getId(), "HR");
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
            return companySecurity.isMember(job.getCompany().getId());
        } catch (Exception e) {
            return false;
        }
    }
}
