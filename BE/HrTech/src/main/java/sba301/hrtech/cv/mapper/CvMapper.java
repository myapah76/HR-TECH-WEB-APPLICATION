package sba301.hrtech.cv.mapper;

import org.mapstruct.*;
import sba301.hrtech.cv.dtos.response.CvDetailResponse;
import sba301.hrtech.cv.dtos.response.CvSummaryResponse;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.entities.CvSkill;

import java.time.Instant;
import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CvMapper {

        @Mapping(target = "createdAt", source = "createdAt")
        CvSummaryResponse toSummaryResponse(Cv entity);

        @Mapping(target = "userId", source = "user.id")
        @Mapping(target = "createdAt", source = "createdAt")
        @Mapping(target = "cvSkills", source = "cvSkills")
        CvDetailResponse toDetailResponse(Cv entity);

        @Mapping(target = "proficiencyLevel", source = "proficiencyLevel", qualifiedByName = "enumToString")
        CvDetailResponse.CvSkillResponse toCvSkillResponse(CvSkill skill);

        List<CvDetailResponse.CvSkillResponse> toCvSkillResponseList(List<CvSkill> skills);

        // ── Helper
        @Named("enumToString")
        default String enumToString(Enum<?> value) {
                if (value == null)
                        return null;
                return value.name();
        }
}