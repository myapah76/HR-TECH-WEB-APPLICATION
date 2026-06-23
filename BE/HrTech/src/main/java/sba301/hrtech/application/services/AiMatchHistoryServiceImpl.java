package sba301.hrtech.application.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.application.abstractions.repositories.AiMatchHistoryRepository;
import sba301.hrtech.application.abstractions.services.IAiMatchHistoryService;
import sba301.hrtech.application.entities.AiMatchHistory;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiMatchHistoryServiceImpl implements IAiMatchHistoryService {

    private final AiMatchHistoryRepository aiMatchHistoryRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<AiMatchHistory> getHistoryEntityByCvAndJob(UUID cvId, UUID jobId) {
        return aiMatchHistoryRepository.findByCvIdAndJobId(cvId, jobId);
    }

    @Override
    @Transactional
    public AiMatchHistory saveHistoryEntity(AiMatchHistory history) {
        return aiMatchHistoryRepository.save(history);
    }
}
