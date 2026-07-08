package hrtech.identity.dtos.user.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserBlockStatusRequest {

    @NotNull(message = "Blocked status is required")
    private Boolean isBlocked;
}
