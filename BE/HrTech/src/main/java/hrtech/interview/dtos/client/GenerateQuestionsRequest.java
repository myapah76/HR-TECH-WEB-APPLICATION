package hrtech.interview.dtos.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class GenerateQuestionsRequest {
    @JsonProperty("cv_text")
    private String cv_text;

    @JsonProperty("jd_text")
    private String jd_text;

    @JsonProperty("target_role")
    private String target_role;

    @JsonProperty("num_questions")
    private Integer num_questions;
}
