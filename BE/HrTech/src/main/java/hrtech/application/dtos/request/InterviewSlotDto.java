package hrtech.application.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSlotDto {
    private UUID id;

    @NotNull(message = "Start time is required")
    private Instant startTime;

    @NotNull(message = "End time is required")
    private Instant endTime;

    private String location;
    private String meetingLink;
    private Boolean isSelected;
    private Boolean isNewSlot;
}
