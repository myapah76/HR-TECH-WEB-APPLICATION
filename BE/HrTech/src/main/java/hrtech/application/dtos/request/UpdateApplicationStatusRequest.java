package hrtech.application.dtos.request;

import lombok.Getter;
import lombok.Setter;
import hrtech.application.entities.enums.ApplicationStatus;

import java.time.Instant;

@Getter
@Setter
public class UpdateApplicationStatusRequest {
    private ApplicationStatus status;
    private Instant acceptedStartDateTime;
    private String acceptedWorkAddress;
    private String acceptedNote;
}
