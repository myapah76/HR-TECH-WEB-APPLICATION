package sba301.hrtech.notification.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.notification.dtos.enums.OtpType;

@Getter
@Setter
@AllArgsConstructor
public class OtpNotificationRequest {
    private OtpRequest otpRequest;
    private String id;
    private OtpType otpType;
}
