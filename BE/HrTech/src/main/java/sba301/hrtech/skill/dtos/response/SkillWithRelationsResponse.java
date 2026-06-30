package sba301.hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillWithRelationsResponse {

    private String id;
    private String name;
    private String description;
    private Boolean isVerified;
    private Instant createdAt;
    private List<String> roles;
    private List<SkillResponse> relatedSkills;
    private List<SkillResponse> children;
}
