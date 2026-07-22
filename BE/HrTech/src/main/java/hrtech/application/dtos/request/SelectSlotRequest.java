package hrtech.application.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelectSlotRequest {

    @NotNull(message = "Slot ID is required")
    private UUID slotId;
}
