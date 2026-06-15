package sba301.hrtech.job.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.abstractions.repositories.JobSearchRepository;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobDocument;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class JobElasticConfig {

    private final JobRepository jobRepository;
    private final JobSearchRepository jobSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations; // 1. Inject Operations

    @Bean
    public ApplicationRunner bootstrapElasticJobs() {
        return args -> {
            log.info("Starting Job Elasticsearch bootstrap...");

            // 2. Safely recreate index and explicitly apply entity mappings (@Field annotations)
            IndexOperations indexOps = elasticsearchOperations.indexOps(JobDocument.class);
            if (indexOps.exists()) {
                indexOps.delete();
            }
            indexOps.create();
            indexOps.putMapping(indexOps.createMapping()); // 👈 This explicitly sets "createdAt" as a date field in ES
            log.info("Elasticsearch 'jobs' index schema put successfully.");

            // 3. Load DB jobs
            List<Job> jobs = jobRepository.findAllWithSkills();
            if (jobs.isEmpty()) {
                log.warn("No jobs found in database to sync to Elasticsearch.");
                return;
            }

            // 4. Map → Document
            List<JobDocument> docs = jobs.stream()
                    .map(this::toDocument)
                    .toList();

            // 5. Save to ES
            jobSearchRepository.saveAll(docs);
            log.info("Elasticsearch sync completed. total={}", docs.size());
        };
    }

    private JobDocument toDocument(Job job) {
        return JobDocument.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .jobType(job.getJobType() != null ? job.getJobType().name() : null)
                .experienceLevel(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)
                .skills(job.getJobSkills().stream()
                        .map(js -> js.getSkillNeo4jId())
                        .toList())
                .createdAt(job.getCreatedAt()) // Matches the date type mapping
                .build();
    }
}