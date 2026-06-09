package sba301.hrtech.company.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sba301.hrtech.company.abstractions.repositories.CompanyMemberRepository;
import sba301.hrtech.company.entities.enums.CompanyPermission;
import sba301.hrtech.company.entities.enums.CompanyStatus;
import sba301.hrtech.company.entities.enums.MembershipStatus;
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
                    if (requiresApprovedCompany(permission)) {
                        if (member.getCompany().getStatus() != CompanyStatus.APPROVED) {
                            return false;
                        }
                    }
                    return rolePermissionResolver.hasPermission(member.getCompanyRole(), permission);
                })
                .orElse(false);
    }
}
