package sba301.hrtech.cv.dtos.response;

import lombok.*;
import java.time.LocalDateTime;
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
    private LocalDateTime createdAt;
}