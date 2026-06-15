package sba301.hrtech.job.abstractions.repositories;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.job.entities.JobDocument;
import java.util.UUID;

@Repository
public interface JobSearchRepository extends
        ElasticsearchRepository<JobDocument, UUID>,
        JobSearchCustomRepository {
}