package sba301.hrtech.auth.Abstrations.Service;



import sba301.hrtech.auth.Dtos.Role.Request.CommonRoleRequest;
import sba301.hrtech.auth.Dtos.Role.Request.CreateRoleRequest;
import sba301.hrtech.auth.Dtos.Role.Response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    RoleResponse createRole(CreateRoleRequest request);
    List<RoleResponse> getAll();
    RoleResponse getById(UUID id);
    RoleResponse getByName(String name);
    RoleResponse update(UUID id, CommonRoleRequest request);
    void deleteById(UUID id);
}
