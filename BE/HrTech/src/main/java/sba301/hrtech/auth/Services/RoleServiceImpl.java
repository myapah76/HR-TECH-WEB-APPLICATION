package sba301.hrtech.auth.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.auth.abstractions.repositories.RoleRepository;
import sba301.hrtech.auth.abstractions.services.IRoleService;
import sba301.hrtech.auth.entities.Role;
import sba301.hrtech.auth.dtos.role.request.CommonRoleRequest;
import sba301.hrtech.auth.dtos.role.request.CreateRoleRequest;
import sba301.hrtech.auth.dtos.role.response.RoleResponse;
import sba301.hrtech.auth.mapper.RoleMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements IRoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        if (roleRepository.findByName(request.getCommonRoleRequest().getName()).isPresent()) {
            throw new RuntimeException("Role name already exists");
        }
        Role role = roleMapper.fromCreateRequest(request);
        roleRepository.save(role);

        return roleMapper.toResponse(role);
    }

    @Override
    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    public RoleResponse getById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        return roleMapper.toResponse(role);
    }

    @Override
    public RoleResponse getByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return roleMapper.toResponse(role);
    }

    @Override
    public RoleResponse update(UUID id, CommonRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        roleMapper.updateRoleFromRequest(request, role);
        roleRepository.save(role);
        return roleMapper.toResponse(role);
    }

    @Override
    public void deleteById(UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new RuntimeException("Role not found");
        }
        roleRepository.deleteById(id);
    }
}
