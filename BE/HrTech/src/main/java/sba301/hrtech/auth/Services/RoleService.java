package sba301.hrtech.auth.Services;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.auth.Abstrations.Repositories.RoleRepository;
import sba301.hrtech.auth.Domain.Entities.Role;
import sba301.hrtech.auth.Dtos.Role.Request.CommonRoleRequest;
import sba301.hrtech.auth.Dtos.Role.Request.CreateRoleRequest;
import sba301.hrtech.auth.Dtos.Role.Response.RoleResponse;
import sba301.hrtech.auth.Mapper.RoleProfile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService  implements sba301.hrtech.auth.Abstrations.Service.RoleService {

    private final RoleRepository roleRepository;
    private final RoleProfile roleProfile;

    @Override
    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        if (roleRepository.findByName(request.getCommonRoleRequest().getName()).isPresent()) {
            throw new RuntimeException("Role name already exists");
        }
        Role role = roleProfile.fromCreateRequest(request);
        roleRepository.save(role);

        return roleProfile.mapToResponse(role);
    }

    @Override
    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(roleProfile::mapToResponse)
                .toList();
    }

    @Override
    public RoleResponse getById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        return roleProfile.mapToResponse(role);
    }

    @Override
    public RoleResponse getByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return roleProfile.mapToResponse(role);
    }

    @Override
    public RoleResponse update(UUID id, CommonRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        roleProfile.update(role, request);
        roleRepository.save(role);
        return roleProfile.mapToResponse(role);
    }

    @Override
    public void deleteById(UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new RuntimeException("Role not found");
        }
        roleRepository.deleteById(id);
    }
}