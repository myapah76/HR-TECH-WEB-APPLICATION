package hrtech.application.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import hrtech.application.abstractions.repositories.ApplicationRepository;
import hrtech.application.entities.Application;
import hrtech.job.security.JobSecurityExpression;
import java.util.UUID;

@Component("applicationSecurity")
@RequiredArgsConstructor
public class ApplicationSecurityExpression {

    private final ApplicationRepository applicationRepository;
    private final JobSecurityExpression jobSecurity;

    public boolean hasApplicationRole(Object applicationId, String... roles) {
        if (applicationId == null) return false;
        try {
            Application app = applicationRepository.findById(UUID.fromString(applicationId.toString())).orElse(null);
            if (app == null || app.getJob() == null) {
                return false;
            }
            return jobSecurity.hasJobRole(app.getJob().getId(), roles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isApplicationOwnerOrManagerOrHr(Object applicationId) {
        return hasApplicationRole(applicationId, "OWNER", "HR_MANAGER", "HR");
    }
}
