package hrtech.job.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import hrtech.company.security.CompanySecurityExpression;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.entities.Job;
import hrtech.identity.entities.User;
import hrtech.identity.utils.AuthUtils;
import java.util.UUID;

@Component("jobSecurity")
@RequiredArgsConstructor
public class JobSecurityExpression {

    private final JobRepository jobRepository;
    private final CompanySecurityExpression companySecurity;
    private final AuthUtils authUtils;

    public boolean hasJobRole(UUID jobId, String... roles) {
        if (jobId == null) return false;
        try {
            User currentUser = authUtils.getCurrentUser();
            if (currentUser.getRole() != null && "ADMIN_SYSTEM".equals(currentUser.getRole().getName())) {
                return true;
            }
            Job job = jobRepository.findById(jobId).orElse(null);
            if (job == null || job.getCompany() == null) {
                return false;
            }
            return companySecurity.hasAnyRole(job.getCompany().getId(), roles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isJobCreatorOrManager(UUID jobId) {
        if (jobId == null) return false;
        try {
            User currentUser = authUtils.getCurrentUser();
            Job job = jobRepository.findById(jobId).orElse(null);
            if (job == null || job.getCompany() == null) {
                return false;
            }

            boolean isCreator = job.getCreatedBy() != null
                    && job.getCreatedBy().getId().equals(currentUser.getId());
            return isCreator || companySecurity.isOwnerOrManager(job.getCompany().getId());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isCompanyRecruiter(UUID jobId) {
        if (jobId == null) return false;
        try {
            User currentUser = authUtils.getCurrentUser();
            if (currentUser.getRole() != null && "ADMIN_SYSTEM".equals(currentUser.getRole().getName())) {
                return true;
            }
            Job job = jobRepository.findById(jobId).orElse(null);
            if (job == null || job.getCompany() == null) {
                return false;
            }
            return companySecurity.isRecruiter(job.getCompany().getId());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isManager(UUID jobId) {
        if (jobId == null) return false;
        try {
            Job job = jobRepository.findById(jobId).orElse(null);
            if (job == null || job.getCompany() == null) {
                return false;
            }
            return companySecurity.isOwnerOrManager(job.getCompany().getId());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean canPerformAction(UUID jobId, String action) {
        if (jobId == null || action == null) return false;
        try {
            return switch (action.toLowerCase()) {
                case "submit", "appeal" -> isJobCreatorOrManager(jobId);
                case "close" -> isManager(jobId);
                default -> false;
            };
        } catch (Exception e) {
            return false;
        }
    }
}
