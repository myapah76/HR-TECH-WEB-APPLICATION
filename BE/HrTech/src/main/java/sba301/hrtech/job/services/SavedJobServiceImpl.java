package sba301.hrtech.job.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.utils.AuthUtils;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.abstractions.repositories.SavedJobRepository;
import sba301.hrtech.job.abstractions.services.ISavedJobService;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.SavedJob;
import sba301.hrtech.job.mapper.JobMapper;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedJobServiceImpl implements ISavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final AuthUtils authUtils;
    private final JobMapper jobMapper;

    @Override
    @Transactional
    public void saveJob(UUID jobId) {
        User currentUser = authUtils.getCurrentUser();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND_CODE, "Job not found"));

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
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND_CODE, "Job not found"));

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
}
