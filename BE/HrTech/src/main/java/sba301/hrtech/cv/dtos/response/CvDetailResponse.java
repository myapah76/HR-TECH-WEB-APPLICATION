package sba301.hrtech.cv.dtos.response;

import lombok.*;
import sba301.hrtech.shared.enums.ExtractionStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvDetailResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private String fileUrl;
    private String parsedContent;
    private Boolean isPrimary;
    private ExtractionStatus extractionStatus;
    private Instant createdAt;
    private List<CvSkillResponse> cvSkills;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CvSkillResponse {
        private UUID id;
        private String skillNeo4jId;
        private String proficiencyLevel;

        private Boolean isAiExtracted;
    }
}