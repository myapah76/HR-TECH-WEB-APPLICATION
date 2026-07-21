package hrtech.job.services;

import hrtech.application.abstractions.services.IApplicationService;
import hrtech.job.abstractions.repositories.JobInterviewRoundRepository;
import hrtech.job.abstractions.services.IJobInterviewRoundService;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.dtos.request.JobInterviewRoundRequest;
import hrtech.job.dtos.response.JobInterviewRoundResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.JobInterviewRound;
import hrtech.job.mapper.JobInterviewRoundMapper;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobInterviewRoundServiceImpl implements IJobInterviewRoundService {

    private final IJobService jobService;
    private final IApplicationService applicationService;
    private final JobInterviewRoundRepository jobInterviewRoundRepository;
    private final JobInterviewRoundMapper jobInterviewRoundMapper;

    @Override
    @Transactional(readOnly = true)
    public List<JobInterviewRoundResponse> getRoundsByJobId(UUID jobId) {
        jobService.getJobEntityById(jobId);
        List<JobInterviewRound> rounds = jobInterviewRoundRepository.findByJobIdOrderByRoundNumberAsc(jobId);
        return jobInterviewRoundMapper.toResponseList(rounds);
    }

    @Override
    @Transactional
    public JobInterviewRoundResponse createRound(UUID jobId, JobInterviewRoundRequest request) {
        Job job = jobService.getJobEntityById(jobId);
        List<JobInterviewRound> existing = jobInterviewRoundRepository.findByJobIdOrderByRoundNumberAsc(jobId);

        // Tự động sinh roundNumber tăng dần tiếp theo (1, 2, 3...)
        int autoRoundNumber = existing.size() + 1;

        JobInterviewRound round = jobInterviewRoundMapper.toEntity(request);
        round.setJob(job);
        round.setRoundNumber(autoRoundNumber);

        return jobInterviewRoundMapper.toResponse(jobInterviewRoundRepository.save(round));
    }

    @Override
    @Transactional
    public JobInterviewRoundResponse updateRound(UUID jobId, UUID roundId, JobInterviewRoundRequest request) {
        JobInterviewRound round = getRoundEntityByIdAndJobId(roundId, jobId);

        if (request.roundName() != null && !request.roundName().isBlank()) {
            round.setRoundName(request.roundName().trim());
        }
        if (request.description() != null) {
            round.setDescription(request.description().trim());
        }

        return jobInterviewRoundMapper.toResponse(jobInterviewRoundRepository.save(round));
    }

    @Override
    @Transactional
    public void deleteRound(UUID jobId, UUID roundId) {
        JobInterviewRound round = getRoundEntityByIdAndJobId(roundId, jobId);
        // Kiểm tra xem có ứng viên nào đang tham gia vòng phỏng vấn này không
        if (applicationService.hasCandidatesInRound(roundId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa vòng phỏng vấn này vì đang có ứng viên tham gia.");
        }

        jobInterviewRoundRepository.delete(round);

        // Sau khi xóa, cập nhật lại roundNumber của các vòng còn lại theo thứ tự 1, 2, 3...
        List<JobInterviewRound> remainingRounds = jobInterviewRoundRepository.findByJobIdOrderByRoundNumberAsc(jobId);
        for (int i = 0; i < remainingRounds.size(); i++) {
            JobInterviewRound r = remainingRounds.get(i);
            if (r.getRoundNumber() != i + 1) {
                r.setRoundNumber(i + 1);
            }
        }
        jobInterviewRoundRepository.saveAll(remainingRounds);
    }

    private JobInterviewRound getRoundEntityByIdAndJobId(UUID roundId, UUID jobId) {
        jobService.getJobEntityById(jobId);
        return jobInterviewRoundRepository.findByIdAndJobId(roundId, jobId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy vòng phỏng vấn với ID đã cho."));
    }
}
