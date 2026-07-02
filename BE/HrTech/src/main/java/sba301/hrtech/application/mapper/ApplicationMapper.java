package sba301.hrtech.application.mapper;

import java.time.Instant;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import sba301.hrtech.application.dtos.response.ApplicationDetailResponse;
import sba301.hrtech.application.dtos.response.ApplicationSummaryResponse;
import sba301.hrtech.application.entities.Application;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ApplicationMapper {

    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobTitle", source = "job.title")
    @Mapping(target = "cvId", source = "cv.id")
    @Mapping(target = "cvTitle", source = "cv.title")
    @Mapping(target = "appliedAt", source = "appliedAt")
    @Mapping(target = "interviewDateTime", source = "interviewDateTime")
    @Mapping(target = "candidatePreferredInterviewDateTime", source = "candidatePreferredInterviewDateTime")
    ApplicationSummaryResponse toSummaryResponse(Application entity);

    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobTitle", source = "job.title")
    @Mapping(target = "cvId", source = "cv.id")
    @Mapping(target = "cvTitle", source = "cv.title")
    @Mapping(target = "appliedAt", source = "appliedAt")
    @Mapping(target = "interviewDateTime", source = "interviewDateTime")
    @Mapping(target = "interviewLocation", source = "interviewLocation")
    @Mapping(target = "interviewMeetingLink", source = "interviewMeetingLink")
    @Mapping(target = "interviewNote", source = "interviewNote")
    @Mapping(target = "candidateInterviewResponseMessage", source = "candidateInterviewResponseMessage")
    @Mapping(target = "candidatePreferredInterviewDateTime", source = "candidatePreferredInterviewDateTime")
    @Mapping(target = "overallScore", source = "applicationScore.overallScore")
    @Mapping(target = "grade", source = "applicationScore.grade", qualifiedByName = "enumToString")
    @Mapping(target = "aiSummary", source = "applicationScore.aiSummary")
    @Mapping(target = "aiSuggestion", source = "applicationScore.aiSuggestion")
    ApplicationDetailResponse toDetailResponse(Application entity);

    // ── Helper
    @Named("enumToString")
    default String enumToString(Enum<?> value) {
        if (value == null)
            return null;
        return value.name();
    }
}
