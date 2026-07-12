package hrtech.company.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import hrtech.company.abstractions.repositories.CompanyMemberRepository;
import hrtech.company.entities.enums.CompanyRole;
import hrtech.identity.dtos.user.CustomUserDetails;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component("companySecurity")
@RequiredArgsConstructor
public class CompanySecurityExpression {

    private final CompanyMemberRepository companyMemberRepository;

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
}
