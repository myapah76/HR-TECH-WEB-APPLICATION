package sba301.hrtech.auth.Mapper;


import org.springframework.stereotype.Component;
import sba301.hrtech.auth.Domain.Entities.Role;
import sba301.hrtech.auth.Dtos.Role.Request.CommonRoleRequest;
import sba301.hrtech.auth.Dtos.Role.Request.CreateRoleRequest;
import sba301.hrtech.auth.Dtos.Role.Response.RoleResponse;

@Component
public class RoleProfile {

    public RoleResponse mapToResponse(Role role) {
        if (role == null) return null;

        RoleResponse res = new RoleResponse();
        res.setId(role.getId());
        res.setName(role.getName());
        res.setSlug(role.getSlug());
        res.setDescription(role.getDescription());
        return res;
    }

    public Role fromCreateRequest(CreateRoleRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request must not be null");
        }

        Role role = new Role();
        role.setSlug(request.getSlug());

        if (request.getCommonRoleRequest() != null) {
            role.setName(request.getCommonRoleRequest().getName());
            role.setDescription(request.getCommonRoleRequest().getDescription());
        }

        return role;
    }

    public void update(Role role, CommonRoleRequest request) {
        if (role == null || request == null) {
            throw new IllegalArgumentException("Role or request must not be null");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            role.setName(request.getName().trim());
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            role.setDescription(request.getDescription().trim());
        }
    }
}
