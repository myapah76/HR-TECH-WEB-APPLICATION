package sba301.hrtech.notification.Abstractions.Cache;

public interface RedisOtpService {

    boolean saveOtp(String email, String otp);

    String getOtp(String email);

    void deleteOtp(String email);

    boolean validateOtp(String email, String inputOtp);
}