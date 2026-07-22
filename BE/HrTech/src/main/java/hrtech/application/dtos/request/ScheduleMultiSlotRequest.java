package hrtech.application.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleMultiSlotRequest {

    @NotEmpty(message = "Application IDs list must not be empty")
    private List<UUID> applicationIds;

    @NotNull(message = "Round number is required")
    private Integer roundNumber;

    @NotEmpty(message = "Slots list must not be empty")
    private List<@Valid InterviewSlotDto> slots;

    private String note;
}
