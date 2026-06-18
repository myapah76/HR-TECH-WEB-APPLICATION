package sba301.hrtech.application.mapper;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

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
    @Mapping(target = "appliedAt", source = "appliedAt", qualifiedByName = "instantToLocalDateTime")
    ApplicationSummaryResponse toSummaryResponse(Application entity);

    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobTitle", source = "job.title")
    @Mapping(target = "cvId", source = "cv.id")
    @Mapping(target = "cvTitle", source = "cv.title")
    @Mapping(target = "appliedAt", source = "appliedAt", qualifiedByName = "instantToLocalDateTime")
    @Mapping(target = "overallScore", source = "applicationScore.overallScore")
    @Mapping(target = "grade", source = "applicationScore.grade", qualifiedByName = "enumToString")
    @Mapping(target = "aiSummary", source = "applicationScore.aiSummary")
    @Mapping(target = "aiSuggestion", source = "applicationScore.aiSuggestion")
    ApplicationDetailResponse toDetailResponse(Application entity);

    // ── Helper
    @Named("instantToLocalDateTime")
    default LocalDateTime instantToLocalDateTime(Instant instant) {
        if (instant == null)
            return null;
        return instant.atZone(ZoneOffset.UTC).toLocalDateTime();
    }

    // ── Helper
    @Named("enumToString")
    default String enumToString(Enum<?> value) {
        if (value == null)
            return null;
        return value.name();
    }
}