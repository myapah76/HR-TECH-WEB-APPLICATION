package hrtech.job.mapper;

import hrtech.job.dtos.request.JobInterviewRoundRequest;
import hrtech.job.dtos.response.JobInterviewRoundResponse;
import hrtech.job.entities.JobInterviewRound;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface JobInterviewRoundMapper {

    @Mapping(target = "jobId", source = "job.id")
    JobInterviewRoundResponse toResponse(JobInterviewRound round);

    List<JobInterviewRoundResponse> toResponseList(List<JobInterviewRound> rounds);

    JobInterviewRound toEntity(JobInterviewRoundRequest request);

    void updateEntityFromRequest(JobInterviewRoundRequest request, @MappingTarget JobInterviewRound round);
}
