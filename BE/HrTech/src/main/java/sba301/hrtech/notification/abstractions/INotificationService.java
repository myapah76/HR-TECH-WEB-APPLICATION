package sba301.hrtech.notification.abstractions;

import sba301.hrtech.notification.dtos.ApplicationStatusNotificationRequest;
import sba301.hrtech.notification.dtos.OtpNotificationRequest;

public interface INotificationService {
    void OtpNotificationHandler(OtpNotificationRequest request);
    void ApplicationStatusNotificationHandler(ApplicationStatusNotificationRequest request);
}
