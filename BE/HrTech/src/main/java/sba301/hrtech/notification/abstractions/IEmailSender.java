package sba301.hrtech.notification.abstractions;

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
            String newStatus,
            java.time.Instant interviewDateTime,
            String interviewLocation,
            String interviewMeetingLink,
            String note,
            String acceptLink,
            String rejectLink);

}
