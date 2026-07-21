package hrtech.application.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRescheduleRequest {

    @NotNull(message = "Accepted boolean status is required")
    private Boolean accepted;

    private String rejectionReason;

    private List<InterviewSlotDto> newSlots;
}
