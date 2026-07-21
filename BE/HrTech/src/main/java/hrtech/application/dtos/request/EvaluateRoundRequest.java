package hrtech.application.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluateRoundRequest {

    @NotNull(message = "Passed boolean is required")
    private Boolean passed;

    private Integer rating;

    private String feedbackNote;

    private Boolean isAttended;
}
