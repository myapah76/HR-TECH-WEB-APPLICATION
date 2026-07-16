package hrtech.company.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import hrtech.company.abstractions.repositories.CompanyMemberRepository;
import hrtech.company.entities.enums.CompanyPermission;
import hrtech.company.entities.enums.CompanyStatus;
import hrtech.company.entities.enums.MembershipStatus;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyPermissionService {

    private final CompanyMemberRepository companyMemberRepository;
    private final CompanyRolePermissionResolver rolePermissionResolver;

    private boolean requiresApprovedCompany(CompanyPermission permission) {
        return permission == CompanyPermission.CREATE_JOB
            || permission == CompanyPermission.UPDATE_JOB
            || permission == CompanyPermission.DELETE_JOB
            || permission == CompanyPermission.VIEW_APPLICANTS
            || permission == CompanyPermission.UPDATE_APPLICATION_STATUS
            || permission == CompanyPermission.APPROVE_JOB
            || permission == CompanyPermission.UPDATE_COMPANY_PROFILE;
    }
    
    public boolean hasPermission(UUID userId, UUID companyId, CompanyPermission permission) {
        return companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, userId)
                .map(member -> {
                    if (member.getMembershipStatus() != MembershipStatus.ACTIVE) {
                        return false;
                    }
                    if (requiresApprovedCompany(permission)
                            && member.getCompany().getStatus() != CompanyStatus.APPROVED) {
                            return false;
                        }

                    return rolePermissionResolver.hasPermission(member.getCompanyRole(), permission);
                })
                .orElse(false);
    }
}
