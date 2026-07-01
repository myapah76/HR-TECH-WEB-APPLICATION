package sba301.hrtech.skill.abstractions.services;

import sba301.hrtech.skill.dtos.request.RoleAliasRequest;
import sba301.hrtech.skill.dtos.response.RoleAliasResponse;

import java.util.List;
import java.util.UUID;

public interface IRoleAliasService {
    List<RoleAliasResponse> getAllRoleAliases();
    List<String> getDistinctCanonicalRoles();
    RoleAliasResponse createRoleAlias(RoleAliasRequest request);
    RoleAliasResponse updateRoleAlias(UUID id, RoleAliasRequest request);
    void deleteRoleAlias(UUID id);
    void renameCanonicalRole(String oldName, String newName);
    void deleteCanonicalRole(String name);
}
