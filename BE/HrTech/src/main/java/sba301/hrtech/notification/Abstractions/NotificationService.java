package sba301.hrtech.notification.Abstractions;

import sba301.hrtech.notification.Dtos.OtpNotificationRequest;

public interface NotificationService {
    void OtpNotificationHandler(OtpNotificationRequest request);
}
