package sba301.hrtech.notification.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ApplicationStatusNotificationRequest {
    private String email;
    private String fullName;
    private String jobTitle;
    private String newStatus;
    private String applicationId;
}
