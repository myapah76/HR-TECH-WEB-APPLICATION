package hrtech.notification.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import hrtech.shared.enums.OtpType;

@Getter
@Setter
@AllArgsConstructor
public class OtpNotificationRequest {
    private OtpRequest otpRequest;
    private String id;
    private OtpType otpType;
}
