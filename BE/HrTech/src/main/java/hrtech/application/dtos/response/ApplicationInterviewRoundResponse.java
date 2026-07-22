package hrtech.application.dtos.response;

import hrtech.application.dtos.request.InterviewSlotDto;
import hrtech.application.entities.enums.InterviewRoundStatus;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationInterviewRoundResponse {

    private UUID id;
    private UUID applicationId;
    private Integer roundNumber;
    private String roundName;
    private InterviewRoundStatus status;
    private Instant scheduledTime;
    private String location;
    private String meetingLink;
    private Instant candidatePreferredTime;
    private String candidateRescheduleReason;
    private String hrRejectionReason;
    private Integer rescheduleCount;
    private String feedbackNote;
    private Integer rating;
    private Instant attendedAt;
    private List<InterviewSlotDto> slots;
}
