package hrtech.skill.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import hrtech.skill.dtos.response.RoleAliasResponse;
import hrtech.skill.dtos.response.SkillResponse;
import hrtech.skill.dtos.response.SkillWithRelationsResponse;
import hrtech.skill.entities.RoleAlias;
import hrtech.skill.entities.SkillNode;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SkillMapper {

    SkillResponse toResponse(SkillNode skillNode);

    List<SkillResponse> toResponseList(List<SkillNode> skillNodes);

    @Mapping(target = "relatedSkills", source = "relatedSkills")
    @Mapping(target = "children", source = "children")
    SkillWithRelationsResponse toRelationsResponse(SkillNode skillNode);

    RoleAliasResponse toRoleAliasResponse(RoleAlias roleAlias);

    List<RoleAliasResponse> toRoleAliasResponseList(List<RoleAlias> roleAliases);
}
