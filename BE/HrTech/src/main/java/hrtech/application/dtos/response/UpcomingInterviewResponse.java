package hrtech.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpcomingInterviewResponse {
    private String company;
    private String position;
    private Instant dateTime;
    private String meetUrl;
    private String location;
    private UUID applicationId;
}
