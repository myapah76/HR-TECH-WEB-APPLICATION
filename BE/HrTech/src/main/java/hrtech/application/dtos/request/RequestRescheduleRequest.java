package hrtech.application.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestRescheduleRequest {

    @NotNull(message = "Preferred time is required")
    private Instant preferredTime;

    @NotBlank(message = "Reason is required")
    private String reason;
}
