package sba301.hrtech.notification.abstractions;

import java.util.concurrent.CompletableFuture;

public interface IEmailSender {

    //async functions
    CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp);
    CompletableFuture<Void> sendPasswordResetEmailAsync(String toEmail, String resetLink);

}
