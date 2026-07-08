package hrtech.application.dtos.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record ScheduleInterviewRequest(
        @NotNull(message = "Interview date/time is required")
        @Future(message = "Interview date/time must be in the future")
        Instant interviewDateTime,
        String interviewLocation,
        String interviewMeetingLink,
        String note
) {
    @AssertTrue(message = "Interview location or meeting link is required")
    public boolean hasLocationOrMeetingLink() {
        return (interviewLocation != null && !interviewLocation.isBlank())
                || (interviewMeetingLink != null && !interviewMeetingLink.isBlank());
    }
}
