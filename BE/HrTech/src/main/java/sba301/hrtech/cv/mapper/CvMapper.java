package sba301.hrtech.cv.mapper;

import org.mapstruct.*;
import sba301.hrtech.cv.dtos.response.CvDetailResponse;
import sba301.hrtech.cv.dtos.response.CvSummaryResponse;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.entities.CvSkill;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CvMapper {

        @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToLocalDateTime")
        CvSummaryResponse toSummaryResponse(Cv entity);

        @Mapping(target = "userId", source = "user.id")
        @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToLocalDateTime")
        @Mapping(target = "cvSkills", source = "cvSkills")
        CvDetailResponse toDetailResponse(Cv entity);

        @Mapping(target = "proficiencyLevel", source = "proficiencyLevel", qualifiedByName = "enumToString")
        CvDetailResponse.CvSkillResponse toCvSkillResponse(CvSkill skill);

        List<CvDetailResponse.CvSkillResponse> toCvSkillResponseList(List<CvSkill> skills);

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