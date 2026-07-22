package hrtech.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import hrtech.application.dtos.response.ApplicationDetailResponse;
import hrtech.application.dtos.response.ApplicationSummaryResponse;
import hrtech.application.entities.Application;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ApplicationMapper {

    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobTitle", source = "job.title")
    @Mapping(target = "candidateName", expression = "java(buildCandidateName(entity))")
    @Mapping(target = "cvId", source = "cv.id")
    @Mapping(target = "cvTitle", source = "cv.title")
    @Mapping(target = "appliedAt", source = "appliedAt")
    ApplicationSummaryResponse toSummaryResponse(Application entity);

    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobTitle", source = "job.title")
    @Mapping(target = "candidateName", expression = "java(buildCandidateName(entity))")
    @Mapping(target = "cvId", source = "cv.id")
    @Mapping(target = "cvTitle", source = "cv.title")
    @Mapping(target = "appliedAt", source = "appliedAt")
    @Mapping(target = "companyName", source = "job.company.name")
    @Mapping(target = "companyAddress", source = "job.company.address")
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

    default String buildCandidateName(Application entity) {
        if (entity == null || entity.getUser() == null) {
            return null;
        }

        String firstName = entity.getUser().getFirstName() == null ? "" : entity.getUser().getFirstName().trim();
        String lastName = entity.getUser().getLastName() == null ? "" : entity.getUser().getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();

        if (!fullName.isBlank()) {
            return fullName;
        }
        if (entity.getUser().getUsername() != null && !entity.getUser().getUsername().isBlank()) {
            return entity.getUser().getUsername();
        }
        return entity.getUser().getEmail();
    }
}
