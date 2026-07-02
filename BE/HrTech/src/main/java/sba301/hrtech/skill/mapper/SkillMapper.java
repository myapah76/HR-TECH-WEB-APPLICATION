package sba301.hrtech.skill.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sba301.hrtech.skill.dtos.response.RoleAliasResponse;
import sba301.hrtech.skill.dtos.response.SkillResponse;
import sba301.hrtech.skill.dtos.response.SkillWithRelationsResponse;
import sba301.hrtech.skill.entities.RoleAlias;
import sba301.hrtech.skill.entities.SkillNode;

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
