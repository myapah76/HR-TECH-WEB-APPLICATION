package hrtech.skill.dtos.response;

import hrtech.skill.entities.SkillNode;

public record SkillProcessResult(
    SkillNode skillNode,
    boolean isNew
) {}
