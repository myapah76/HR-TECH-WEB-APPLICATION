package hrtech.application.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalConfirmationRequest {

    @NotNull(message = "Approved boolean is required")
    private Boolean approved;

    private String note;
}
