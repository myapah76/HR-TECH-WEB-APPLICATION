package sba301.hrtech.skill.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

import java.time.Instant;

@Node("Skill")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillNode {

    @Id
    private String id; // UUID string

    @Property("name")
    private String name;

    @Property("category")
    private String category;

    @Property("description")
    private String description;

    @Property("is_verified")
    private Boolean isVerified;

    @Property("created_at")
    private Instant createdAt;

    @Property("updated_at")
    private Instant updatedAt;
}
