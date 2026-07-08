package hrtech.cv.dtos.response;

import lombok.*;
import hrtech.shared.enums.ExtractionStatus;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvSummaryResponse {
    private UUID id;
    private String title;
    private String fileUrl;
    private Boolean isPrimary;
    private ExtractionStatus extractionStatus;
    private Instant createdAt;
}