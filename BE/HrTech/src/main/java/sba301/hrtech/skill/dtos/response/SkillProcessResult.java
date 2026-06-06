package sba301.hrtech.skill.dtos.response;

import sba301.hrtech.skill.entities.SkillNode;

public record SkillProcessResult(
    SkillNode skillNode,
    boolean isNew
) {}
