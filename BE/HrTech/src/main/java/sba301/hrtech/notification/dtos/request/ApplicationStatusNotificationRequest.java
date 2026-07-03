package sba301.hrtech.notification.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
public class ApplicationStatusNotificationRequest {
    private String email;
    private String fullName;
    private String jobTitle;
    private String newStatus;
    private String applicationId;
    private Instant interviewDateTime;
    private String interviewLocation;
    private String interviewMeetingLink;
    private String note;
    private String actionLink;
    private String actionLabel;
}
