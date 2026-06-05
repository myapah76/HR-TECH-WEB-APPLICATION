package sba301.hrtech.cv.mapper;

import org.springframework.stereotype.Component;
import sba301.hrtech.cv.dtos.CvDetailResponse;
import sba301.hrtech.cv.dtos.CvSummaryResponse;
import sba301.hrtech.cv.entities.Cv;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;

@Component
public class CvMapper {

    public CvSummaryResponse toSummaryResponse(Cv entity) {
        if (entity == null) return null;

        return CvSummaryResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .fileUrl(entity.getFileUrl())
                .isPrimary(entity.getIsPrimary())
                .createdAt(toLocalDateTime(entity.getCreatedAt()))
                .build();
    }

    public CvDetailResponse toDetailResponse(Cv entity) {
        if (entity == null) return null;

        List<CvDetailResponse.CvSkillResponse> skillResponses = entity.getCvSkills() == null
                ? Collections.emptyList()
                : entity.getCvSkills().stream()
                .map(skill -> CvDetailResponse.CvSkillResponse.builder()
                        .id(skill.getId())
                        .skillNeo4jId(skill.getSkillNeo4jId())
                        .proficiencyLevel(skill.getProficiencyLevel() != null
                                ? skill.getProficiencyLevel().name()
                                : null)
                        .yearsOfExperience(skill.getYearsOfExperience())
                        .isAiExtracted(skill.getIsAiExtracted())
                        .build())
                .toList();

        return CvDetailResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .title(entity.getTitle())
                .fileUrl(entity.getFileUrl())
                .parsedContent(entity.getParsedContent())
                .isPrimary(entity.getIsPrimary())
                .createdAt(toLocalDateTime(entity.getCreatedAt()))
                .cvSkills(skillResponses)
                .build();
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(ZoneOffset.UTC).toLocalDateTime();
    }
}