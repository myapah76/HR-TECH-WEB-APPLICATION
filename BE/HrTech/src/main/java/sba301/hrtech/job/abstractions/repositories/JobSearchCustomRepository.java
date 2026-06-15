package sba301.hrtech.job.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sba301.hrtech.job.entities.JobDocument;

public interface JobSearchCustomRepository {
    Page<JobDocument> search(String keyword, Pageable pageable);
}
