package hrtech.company.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterActiveJobResponse {
    private UUID id;
    private String title;
    private String location;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private long applicantCount;
}
