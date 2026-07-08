package hrtech.job.abstractions.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import hrtech.job.dtos.response.JobResponse;

import java.util.UUID;

public interface ISavedJobService {
    void saveJob(UUID jobId);
    void unsaveJob(UUID jobId);
    Page<JobResponse> getSavedJobs(Pageable pageable);
}
