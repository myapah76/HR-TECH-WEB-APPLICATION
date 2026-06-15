package sba301.hrtech.job.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(indexName = "jobs")
@JsonIgnoreProperties(ignoreUnknown = true) // Ignores Spring's metadata "_class" field
public class JobDocument {

    @Id
    private UUID id; // Spring Data ES handles UUID conversion cleanly via toString() automatically

    private String title;

    private String description;

    private String location;

    private List<String> skills;

    private String experienceLevel;

    private String jobType;

    // Converted to explicit Elasticsearch Date types
    @Field(type = FieldType.Date, format = {}, pattern = "uuuu-MM-dd'T'HH:mm:ss.SSSX||epoch_millis")
    private Instant createdAt;

    @Field(type = FieldType.Date, format = {}, pattern = "uuuu-MM-dd'T'HH:mm:ss.SSSX||epoch_millis")
    private Instant updatedAt;
}