package hrtech.job.abstractions.services;

import hrtech.shared.dtos.RecentActivityResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.entities.SavedJob;

import java.util.List;
import java.util.UUID;

public interface ISavedJobService {
    void saveJob(UUID jobId);
    void unsaveJob(UUID jobId);
    Page<JobResponse> getSavedJobs(Pageable pageable);
    long countSavedJobsByUserId(UUID userId);
    List<SavedJob> getRecentSavedJobs(UUID userId, int limit);
    long countMySavedJobs();
    List<RecentActivityResponse> getMyRecentActivities(int limit);
}
