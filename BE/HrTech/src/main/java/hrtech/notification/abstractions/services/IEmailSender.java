package hrtech.notification.abstractions.services;

import java.time.Instant;
import java.util.concurrent.CompletableFuture;

public interface IEmailSender {

    //async functions
    CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp);
    CompletableFuture<Void> sendPasswordResetEmailAsync(String toEmail, String resetLink);
    CompletableFuture<Void> sendWelcomeEmailAsync(String toEmail, String fullName, String password, String companyName);
    CompletableFuture<Void> sendApplicationStatusUpdateEmailAsync(
            String toEmail,
            String fullName,
            String jobTitle,
            String companyName,
            String newStatus,
            Instant interviewDateTime,
            String interviewLocation,
            String interviewMeetingLink,
            String note,
            String actionLink,
            String actionLabel,
            Instant acceptedStartDateTime,
            String acceptedWorkAddress,
            String acceptedNote);

}
