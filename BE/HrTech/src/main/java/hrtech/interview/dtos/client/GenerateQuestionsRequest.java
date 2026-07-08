package hrtech.interview.dtos.client;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class GenerateQuestionsRequest {
    private String cv_text;
    private String jd_text;
    private String target_role;
}
