package sba301.hrtech.notification.Abstractions;


import java.util.concurrent.CompletableFuture;

public interface EmailSender {

    //async functions
    CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp);
    CompletableFuture<Void> sendPasswordResetEmailAsync(String toEmail, String resetLink);

}