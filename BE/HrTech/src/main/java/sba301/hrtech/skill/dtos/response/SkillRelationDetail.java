package sba301.hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillRelationDetail {
    private String target;
    private String parent;
    private String child;
    private String type;
}
