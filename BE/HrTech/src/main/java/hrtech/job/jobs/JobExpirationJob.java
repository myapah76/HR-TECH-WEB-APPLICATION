package hrtech.job.jobs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.entities.Job;
import hrtech.job.entities.enums.JobStatus;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobExpirationJob {

    private final JobRepository jobRepository;

    @Scheduled(cron = "0 0 * * * *") // Runs at the top of every hour
    @Transactional
    public void closeExpiredJobs() {
        log.info("Starting JobExpirationJob to find and close expired jobs...");
        
        List<Job> expiredJobs = jobRepository.findByStatusAndDeadlineLessThanEqualAndDeletedFalse(
                JobStatus.APPROVED, Instant.now());
                
        if (expiredJobs.isEmpty()) {
            log.info("No expired jobs found.");
            return;
        }

        log.info("Found {} expired jobs. Closing them...", expiredJobs.size());
        
        for (Job job : expiredJobs) {
            job.setStatus(JobStatus.CLOSED);
            log.info("Closed expired job ID: {}", job.getId());
        }
        
        jobRepository.saveAll(expiredJobs);
        log.info("JobExpirationJob completed successfully.");
    }
}
