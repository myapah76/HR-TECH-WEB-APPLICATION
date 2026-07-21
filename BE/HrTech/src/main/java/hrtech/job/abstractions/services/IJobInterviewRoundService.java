package hrtech.job.abstractions.services;

import hrtech.job.dtos.request.JobInterviewRoundRequest;
import hrtech.job.dtos.response.JobInterviewRoundResponse;

import java.util.List;
import java.util.UUID;

public interface IJobInterviewRoundService {
    List<JobInterviewRoundResponse> getRoundsByJobId(UUID jobId);

    JobInterviewRoundResponse createRound(UUID jobId, JobInterviewRoundRequest request);

    JobInterviewRoundResponse updateRound(UUID jobId, UUID roundId, JobInterviewRoundRequest request);

    void deleteRound(UUID jobId, UUID roundId);
}
