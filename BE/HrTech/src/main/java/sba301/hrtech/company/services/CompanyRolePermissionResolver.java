package sba301.hrtech.company.services;

import org.springframework.stereotype.Component;
import sba301.hrtech.company.entities.enums.CompanyPermission;
import sba301.hrtech.company.entities.enums.CompanyRole;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

@Component
public class CompanyRolePermissionResolver {

    private final Map<CompanyRole, Set<CompanyPermission>> mapping = new EnumMap<>(CompanyRole.class);

    public CompanyRolePermissionResolver() {
        mapping.put(CompanyRole.OWNER, Set.of(
            CompanyPermission.MANAGE_MEMBERS,
            CompanyPermission.VIEW_APPLICANTS,
            CompanyPermission.UPDATE_COMPANY_PROFILE,
            CompanyPermission.APPROVE_JOB
        ));
        
        mapping.put(CompanyRole.HR_MANAGER, Set.of(
            CompanyPermission.CREATE_JOB,
            CompanyPermission.UPDATE_JOB,
            CompanyPermission.DELETE_JOB,
            CompanyPermission.VIEW_APPLICANTS,
            CompanyPermission.UPDATE_APPLICATION_STATUS,
            CompanyPermission.APPROVE_JOB
        ));
        
        mapping.put(CompanyRole.HR, Set.of(
            CompanyPermission.CREATE_JOB,
            CompanyPermission.UPDATE_JOB,
            CompanyPermission.VIEW_APPLICANTS
        ));
    }

    public boolean hasPermission(CompanyRole role, CompanyPermission permission) {
        Set<CompanyPermission> permissions = mapping.get(role);
        return permissions != null && permissions.contains(permission);
    }
}
