package sba301.hrtech.skill.listeners;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import sba301.hrtech.shared.events.CvExtractionRequestedEvent;
import sba301.hrtech.shared.events.JobExtractionRequestedEvent;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;

@Component
@RequiredArgsConstructor
@Slf4j
public class SkillExtractionEventListener {

    private final ISkillExtractionService skillExtractionService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCvExtraction(CvExtractionRequestedEvent event) {
        log.info("Received CvExtractionRequestedEvent for CV ID: {}", event.cvId());
        skillExtractionService.extractAndSaveSkills(event.cvId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleJobExtraction(JobExtractionRequestedEvent event) {
        log.info("Received JobExtractionRequestedEvent for Job ID: {}", event.jobId());
        skillExtractionService.extractAndSaveJobSkills(event.jobId());
    }
}
