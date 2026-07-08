package hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.cv.entities.Cv;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.entities.Job;
import hrtech.shared.enums.ExtractionStatus;
import hrtech.skill.abstractions.services.ISkillExtractionService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RagSyncScheduler {

    private final IJobService jobService;
    private final ICvService cvService;
    private final ISkillExtractionService skillExtractionService;

    @Scheduled(cron = "0 0/5 * * * ?")
    public void syncStuckExtractions() {
        log.info("Running RAG & Graph Sync Scheduler...");
        Instant threshold = Instant.now().minus(5, ChronoUnit.MINUTES);
        List<ExtractionStatus> statuses = List.of(ExtractionStatus.PENDING, ExtractionStatus.FAILED);

        List<Job> stuckJobs = jobService.findStuckJobs(statuses, threshold);
        for (Job job : stuckJobs) {
            log.info("Retrying extraction and RAG sync for stuck Job: {}", job.getId());
            try {
                skillExtractionService.extractAndSaveJobSkills(job.getId());
            } catch (Exception e) {
                log.error("Failed to retry job sync for {}", job.getId(), e);
            }
        }

        List<Cv> stuckCvs = cvService.findStuckCvs(statuses, threshold);
        for (Cv cv : stuckCvs) {
            log.info("Retrying extraction and RAG sync for stuck CV: {}", cv.getId());
            try {
                skillExtractionService.extractAndSaveSkills(cv.getId());
            } catch (Exception e) {
                log.error("Failed to retry cv sync for {}", cv.getId(), e);
            }
        }
    }
}
