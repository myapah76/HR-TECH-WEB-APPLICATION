package hrtech.company.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import hrtech.company.abstractions.repositories.CompanyMemberRepository;
import hrtech.company.entities.enums.CompanyRole;
import hrtech.identity.utils.AuthUtils;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component("companySecurity")
@RequiredArgsConstructor
public class CompanySecurityExpression {

    private final CompanyMemberRepository companyMemberRepository;
    private final AuthUtils authUtils;

    private boolean hasRole(UUID companyId, String... roles) {
        try {
            UUID currentUserId = authUtils.getCurrentUserId();

            List<CompanyRole> requiredRoles = Arrays.stream(roles)
                    .map(CompanyRole::valueOf)
                    .toList();

            return companyMemberRepository.existsByCompanyIdAndUserIdAndCompanyRoleInAndDeletedFalse(
                    companyId, currentUserId, requiredRoles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasAnyRole(UUID companyId, String... roles) {
        return hasRole(companyId, roles);
    }

    public boolean isOwner(UUID companyId) {
        return hasRole(companyId, "OWNER");
    }

    public boolean isOwnerOrManager(UUID companyId) {
        return hasRole(companyId, "OWNER", "HR_MANAGER");
    }

    public boolean isRecruiter(UUID companyId) {
        return hasRole(companyId, "OWNER", "HR_MANAGER", "HR");
    }

    public boolean isHr(UUID companyId) {
        return hasRole(companyId, "HR");
    }

    public boolean isManager(UUID companyId) {
        return hasRole(companyId, "HR_MANAGER");
    }
}
