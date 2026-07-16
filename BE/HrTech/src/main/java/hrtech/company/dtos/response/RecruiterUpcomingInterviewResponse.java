package hrtech.company.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterUpcomingInterviewResponse {
    private String cvTitle;
    private String jobTitle;
    private Instant interviewDateTime;
    private String status;
}
