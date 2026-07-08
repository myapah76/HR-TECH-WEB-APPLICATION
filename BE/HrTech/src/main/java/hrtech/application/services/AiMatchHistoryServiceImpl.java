package hrtech.application.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.application.abstractions.repositories.AiMatchHistoryRepository;
import hrtech.application.abstractions.services.IAiMatchHistoryService;
import hrtech.application.entities.AiMatchHistory;

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
