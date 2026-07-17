package hrtech.job.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewJobPostingRequest {
    private String title;
    private String description;
    private String requirements;
    private String location;
    private Double salary_min;
    private Double salary_max;
    private String job_type;
    private String experience_level;
    private String position;
}
