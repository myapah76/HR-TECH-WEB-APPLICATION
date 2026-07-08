package hrtech.identity.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.identity.abstractions.repositories.RoleRepository;
import hrtech.identity.abstractions.services.IRoleService;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.identity.entities.Role;
import hrtech.identity.dtos.role.request.CommonRoleRequest;
import hrtech.identity.dtos.role.request.CreateRoleRequest;
import hrtech.identity.dtos.role.response.RoleResponse;
import hrtech.identity.mapper.RoleMapper;

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
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
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
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        return roleMapper.toResponse(role);
    }

    @Override
    public RoleResponse getByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return roleMapper.toResponse(role);
    }

    @Override
    public RoleResponse update(UUID id, CommonRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        roleMapper.updateRoleFromRequest(request, role);
        roleRepository.save(role);
        return roleMapper.toResponse(role);
    }

    @Override
    public void deleteById(UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        roleRepository.deleteById(id);
    }

    @Override
    public Role getRoleEntityById(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }

    @Override
    public Role getRoleEntityByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }
}
