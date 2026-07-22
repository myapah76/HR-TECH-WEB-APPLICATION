package hrtech.notification.abstractions.services;

import java.util.concurrent.CompletableFuture;

public interface IEmailSender {

    // async functions
    CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp);

    CompletableFuture<Void> sendPasswordResetEmailAsync(String toEmail, String resetLink);

    CompletableFuture<Void> sendWelcomeEmailAsync(String toEmail, String fullName, String password, String companyName);

    CompletableFuture<Void> sendApplicationAcceptedEmailAsync(String toEmail, String fullName, String jobTitle,
            String companyName);

    CompletableFuture<Void> sendApplicationRejectedEmailAsync(String toEmail, String fullName, String jobTitle,
            String companyName);

    CompletableFuture<Void> sendInterviewScheduleEmailAsync(String toEmail, String fullName, String jobTitle,
            String roundName, String companyName);
}
