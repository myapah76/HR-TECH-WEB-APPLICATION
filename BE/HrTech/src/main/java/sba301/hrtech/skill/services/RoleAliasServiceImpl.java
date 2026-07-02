package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.skill.abstractions.repositories.RoleAliasRepository;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.abstractions.services.IRoleAliasService;
import sba301.hrtech.skill.dtos.request.RoleAliasRequest;
import sba301.hrtech.skill.dtos.response.RoleAliasResponse;
import sba301.hrtech.skill.entities.RoleAlias;
import sba301.hrtech.skill.mapper.SkillMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleAliasServiceImpl implements IRoleAliasService {

    private final RoleAliasRepository roleAliasRepository;
    private final SkillNodeRepository skillNodeRepository;
    private final SkillMapper skillMapper;

    @Override
    public List<RoleAliasResponse> getAllRoleAliases() {
        return skillMapper.toRoleAliasResponseList(roleAliasRepository.findAll());
    }

    @Override
    public List<String> getDistinctCanonicalRoles() {
        return roleAliasRepository.findDistinctCanonicalRoles();
    }

    @Override
    public RoleAliasResponse createRoleAlias(RoleAliasRequest request) {
        String alias = request.getAlias().trim().toLowerCase();
        if (roleAliasRepository.findByAliasIgnoreCase(alias).isPresent()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Alias đã tồn tại: " + alias);
        }
        RoleAlias entity = RoleAlias.builder()
                .alias(alias)
                .canonicalRole(request.getCanonicalRole().trim().toLowerCase())
                .build();
        RoleAlias saved = roleAliasRepository.save(entity);
        log.info("Created RoleAlias: {} -> {}", saved.getAlias(), saved.getCanonicalRole());
        return skillMapper.toRoleAliasResponse(saved);
    }

    @Override
    public RoleAliasResponse updateRoleAlias(UUID id, RoleAliasRequest request) {
        RoleAlias entity = roleAliasRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy alias"));

        String newAlias = request.getAlias().trim().toLowerCase();
        roleAliasRepository.findByAliasIgnoreCase(newAlias).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Alias đã tồn tại: " + newAlias);
            }
        });

        entity.setAlias(newAlias);
        entity.setCanonicalRole(request.getCanonicalRole().trim().toLowerCase());
        RoleAlias saved = roleAliasRepository.save(entity);
        log.info("Updated RoleAlias {}: {} -> {}", saved.getId(), saved.getAlias(), saved.getCanonicalRole());
        return skillMapper.toRoleAliasResponse(saved);
    }

    @Override
    public void deleteRoleAlias(UUID id) {
        if (!roleAliasRepository.existsById(id)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy alias");
        }
        roleAliasRepository.deleteById(id);
        log.info("Deleted RoleAlias: {}", id);
    }

    @Override
    @Transactional
    public void renameCanonicalRole(String oldName, String newName) {
        String oldClean = oldName.trim().toLowerCase();
        String newClean = newName.trim().toLowerCase();
        if (oldClean.equals(newClean)) return;

        // 1. Update all matching aliases in SQL
        List<RoleAlias> aliases = roleAliasRepository.findAll();
        boolean updated = false;
        for (RoleAlias alias : aliases) {
            if (alias.getCanonicalRole().trim().toLowerCase().equals(oldClean)) {
                alias.setCanonicalRole(newClean);
                roleAliasRepository.save(alias);
                updated = true;
            }
        }
        if (!updated) {
            throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy vai trò chuẩn: " + oldName);
        }

        // 2. Cascade update roles in Neo4j skill nodes
        skillNodeRepository.renameRoleInSkills(oldClean, newClean);
        log.info("Renamed canonical role in SQL & Neo4j: {} -> {}", oldClean, newClean);
    }

    @Override
    @Transactional
    public void deleteCanonicalRole(String name) {
        String cleanName = name.trim().toLowerCase();

        // 1. Delete all matching aliases in SQL
        List<RoleAlias> aliases = roleAliasRepository.findAll();
        boolean deleted = false;
        for (RoleAlias alias : aliases) {
            if (alias.getCanonicalRole().trim().toLowerCase().equals(cleanName)) {
                roleAliasRepository.delete(alias);
                deleted = true;
            }
        }
        if (!deleted) {
            throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy vai trò chuẩn: " + name);
        }

        // 2. Cascade remove role in Neo4j skill nodes
        skillNodeRepository.removeRoleFromSkills(cleanName);
        log.info("Deleted canonical role in SQL & cascade removed from Neo4j: {}", cleanName);
    }
}
