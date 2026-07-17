package hrtech.job.services;

import hrtech.identity.entities.User;
import hrtech.identity.utils.AuthUtils;
import hrtech.job.abstractions.repositories.SavedJobRepository;
import hrtech.job.abstractions.services.ISavedJobService;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.dtos.response.JobResponse;
import hrtech.shared.dtos.RecentActivityResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.SavedJob;
import hrtech.job.mapper.JobMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedJobServiceImpl implements ISavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final AuthUtils authUtils;
    private final JobMapper jobMapper;

    @Autowired
    @Lazy
    private IJobService jobService;

    @Override
    @Transactional
    public void saveJob(UUID jobId) {
        User currentUser = authUtils.getCurrentUser();
        Job job = jobService.getJobEntityById(jobId);
        if (!savedJobRepository.existsByUserAndJob(currentUser, job)) {
            SavedJob savedJob = SavedJob.builder()
                    .user(currentUser)
                    .job(job)
                    .build();
            savedJobRepository.save(savedJob);
        }
    }

    @Override
    @Transactional
    public void unsaveJob(UUID jobId) {
        User currentUser = authUtils.getCurrentUser();
        Job job = jobService.getJobEntityById(jobId);
        Optional<SavedJob> savedJob = savedJobRepository.findByUserAndJob(currentUser, job);
        savedJob.ifPresent(savedJobRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getSavedJobs(Pageable pageable) {
        User currentUser = authUtils.getCurrentUser();
        Page<SavedJob> savedJobsPage = savedJobRepository.findByUser(currentUser, pageable);
        return savedJobsPage.map(savedJob -> jobMapper.toResponse(savedJob.getJob()));
    }

    @Override
    @Transactional(readOnly = true)
    public long countSavedJobsByUserId(UUID userId) {
        return savedJobRepository.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedJob> getRecentSavedJobs(UUID userId, int limit) {
        return savedJobRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit));
    }

    @Override
    @Transactional(readOnly = true)
    public long countMySavedJobs() {
        UUID currentUserId = authUtils.getCurrentUserId();
        return savedJobRepository.countByUserId(currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecentActivityResponse> getMyRecentActivities(int limit) {
        UUID currentUserId = authUtils.getCurrentUserId();
        List<SavedJob> recentSavedJobs = savedJobRepository.findByUserIdOrderByCreatedAtDesc(
                currentUserId, PageRequest.of(0, limit));
        return recentSavedJobs.stream().map(savedJob -> {
            String jobTitle = savedJob.getJob() != null ? savedJob.getJob().getTitle() : "Việc làm";
            String companyName = (savedJob.getJob() != null && savedJob.getJob().getCompany() != null)
                    ? savedJob.getJob().getCompany().getName() : "Nhà tuyển dụng";
            return RecentActivityResponse.builder()
                    .action("Lưu việc làm: " + jobTitle + " tại " + companyName)
                    .date(savedJob.getCreatedAt())
                    .status("saved")
                    .build();
        }).toList();
    }
}
