package sba301.hrtech.skill.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Component;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.entities.SkillNode;
import sba301.hrtech.skill.services.AiServiceClient;

import java.io.InputStream;
import java.time.Instant;
import java.util.*;

/**
 * Seeds minimal skill data into Neo4j on startup for testing.
 * Also creates the vector index for embedding similarity search.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class Neo4jDataSeeder implements CommandLineRunner {

    private final SkillNodeRepository skillNodeRepository;
    private final AiServiceClient aiServiceClient;
    private final Neo4jClient neo4jClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:skills-seed.json")
    private Resource skillsSeedResource;

    @Data
    public static class SkillSeedDto {
        private String name;
        private List<String> related;
    }

    @Override
    public void run(String... args) {
        try {
            createVectorIndex();
            seedSkills();
            seedRelationships();
        } catch (Exception e) {
            log.warn("Neo4j seeding partially failed (Ollama may not be running): {}", e.getMessage());
        }
    }

    private void createVectorIndex() {
        try {
            // Check if Ollama is available to determine embedding dimension
            if (!aiServiceClient.isAvailable()) {
                log.warn("AI Service is not available. Skipping vector index creation. " +
                        "Run the Python AI Microservice and restart the app.");
                return;
            }

            // Generate a test embedding to detect dimension
            List<Double> testEmbedding = aiServiceClient.generateEmbedding("test");
            int dimension = testEmbedding.size();

            if (dimension > 0) {
                neo4jClient.query("""
                            CREATE VECTOR INDEX skill_embedding_index IF NOT EXISTS
                            FOR (s:Skill) ON (s.embedding)
                            OPTIONS {indexConfig: {
                                `vector.dimensions`: %d,
                                `vector.similarity_function`: 'cosine'
                            }}
                        """.formatted(dimension)).run();

                log.info("Created Neo4j vector index with dimension: {}", dimension);
            }
        } catch (Exception e) {
            log.warn("Vector index creation skipped: {}", e.getMessage());
        }
    }

    private void seedSkills() {
        long existingCount = skillNodeRepository.count();
        if (existingCount > 0) {
            log.info("Neo4j already has {} skills, skipping seed", existingCount);
            return;
        }

        try (InputStream inputStream = skillsSeedResource.getInputStream()) {
            List<SkillSeedDto> seedData = objectMapper.readValue(inputStream, new TypeReference<List<SkillSeedDto>>() {
            });
            log.info("Seeding {} skills into Neo4j from JSON file...", seedData.size());

            boolean aiAvailable = aiServiceClient.isAvailable();
            if (!aiAvailable) {
                log.warn("AI Service not available — seeding skills WITHOUT embeddings");
            }

            // Extract all skill names for batch embedding
            List<String> skillNames = seedData.stream().map(SkillSeedDto::getName).toList();
            List<List<Double>> batchEmbeddings = aiAvailable
                    ? aiServiceClient.generateEmbeddings(skillNames)
                    : Collections.nCopies(skillNames.size(), Collections.emptyList());

            List<SkillNode> skillsToSave = new ArrayList<>();
            for (int i = 0; i < seedData.size(); i++) {
                SkillSeedDto seedItem = seedData.get(i);
                List<Double> embedding = batchEmbeddings.get(i);

                SkillNode skill = SkillNode.builder()
                        .id(UUID.randomUUID().toString())
                        .name(seedItem.getName())
                        .isVerified(true)
                        .embedding(embedding)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build();

                skillsToSave.add(skill);
            }
            skillNodeRepository.saveAll(skillsToSave);
            log.info("Seeded {} skills successfully", seedData.size());
        } catch (Exception e) {
            log.error("Failed to read or seed skills from JSON: {}", e.getMessage(), e);
        }
    }

    private void seedRelationships() {
        long existingCount = skillNodeRepository.count();
        if (existingCount == 0)
            return;

        try (InputStream inputStream = skillsSeedResource.getInputStream()) {
            List<SkillSeedDto> seedData = objectMapper.readValue(inputStream, new TypeReference<List<SkillSeedDto>>() {
            });
            int relationshipCount = 0;

            for (SkillSeedDto seedItem : seedData) {
                if (seedItem.getRelated() == null || seedItem.getRelated().isEmpty())
                    continue;

                Optional<SkillNode> source = skillNodeRepository.findByNameIgnoreCase(seedItem.getName());
                if (source.isEmpty())
                    continue;

                SkillNode srcNode = source.get();
                if (srcNode.getRelatedSkills() == null) {
                    srcNode.setRelatedSkills(new ArrayList<>());
                }

                for (String relatedName : seedItem.getRelated()) {
                    Optional<SkillNode> target = skillNodeRepository.findByNameIgnoreCase(relatedName);
                    if (target.isPresent()) {
                        boolean alreadyLinked = srcNode.getRelatedSkills().stream()
                                .anyMatch(r -> r.getId().equals(target.get().getId()));

                        if (!alreadyLinked) {
                            srcNode.getRelatedSkills().add(target.get());
                            relationshipCount++;
                        }
                    }
                }
                skillNodeRepository.save(srcNode);
            }
            log.info("Seeded {} relationships", relationshipCount);
        } catch (Exception e) {
            log.error("Failed to seed relationships from JSON: {}", e.getMessage(), e);
        }
    }
}
