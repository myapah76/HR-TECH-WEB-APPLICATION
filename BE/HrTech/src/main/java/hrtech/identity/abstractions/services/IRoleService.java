package hrtech.identity.abstractions.services;

import hrtech.identity.dtos.role.request.CommonRoleRequest;
import hrtech.identity.dtos.role.request.CreateRoleRequest;
import hrtech.identity.dtos.role.response.RoleResponse;
import hrtech.identity.entities.Role;

import java.util.List;
import java.util.UUID;

public interface IRoleService {
    RoleResponse createRole(CreateRoleRequest request);
    List<RoleResponse> getAll();
    RoleResponse getById(UUID id);
    RoleResponse getByName(String name);
    RoleResponse update(UUID id, CommonRoleRequest request);
    void deleteById(UUID id);

    Role getRoleEntityById(UUID id);
    Role getRoleEntityByName(String name);
}
