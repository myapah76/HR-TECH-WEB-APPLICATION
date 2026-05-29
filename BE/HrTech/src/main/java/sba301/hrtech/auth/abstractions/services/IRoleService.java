package sba301.hrtech.auth.abstractions.services;

import sba301.hrtech.auth.dtos.role.request.CommonRoleRequest;
import sba301.hrtech.auth.dtos.role.request.CreateRoleRequest;
import sba301.hrtech.auth.dtos.role.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface IRoleService {
    RoleResponse createRole(CreateRoleRequest request);
    List<RoleResponse> getAll();
    RoleResponse getById(UUID id);
    RoleResponse getByName(String name);
    RoleResponse update(UUID id, CommonRoleRequest request);
    void deleteById(UUID id);
}
