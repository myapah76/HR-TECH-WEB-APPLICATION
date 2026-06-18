package sba301.hrtech.skill.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.*;
import org.springframework.data.neo4j.core.support.UUIDStringGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Node("Skill")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillNode {

    @Id
    @GeneratedValue(UUIDStringGenerator.class)
    private String id; // UUID string

    @Property("name")
    private String name;

    @Property("description")
    private String description;

    @Property("is_verified")
    private Boolean isVerified;

    @Property("created_at")
    private Instant createdAt;

    @Property("updated_at")
    private Instant updatedAt;

    // === Neo4j Relationships ===

    @Relationship(type = "RELATED_TO", direction = Relationship.Direction.OUTGOING)
    @Builder.Default
    private List<SkillNode> relatedSkills = new ArrayList<>();

    @Relationship(type = "PARENT_OF", direction = Relationship.Direction.OUTGOING)
    @Builder.Default
    private List<SkillNode> children = new ArrayList<>();
}
