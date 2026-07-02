package sba301.hrtech.notification.services;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;
import sba301.hrtech.notification.abstractions.IEmailSender;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.system.abstractions.services.SystemConfigService;
import sba301.hrtech.system.entities.SystemConfig;

import java.time.Year;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSenderImpl implements IEmailSender {

    private final SystemConfigService systemConfigService;

    private final SpringTemplateEngine templateEngine;

    @Override
    @Async
    public CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp) {

        try {
            Context context = new Context();
            context.setVariable("otp", otp);
            context.setVariable("year", Year.now().getValue());
            String html = templateEngine.process("email/otp", context);
            sendHtmlEmail(toEmail, "OTP Verification Code", html);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED, "Failed to send OTP email: " + e.getMessage());
        }
    }

    @Override
    @Async
    public CompletableFuture<Void> sendPasswordResetEmailAsync(String toEmail, String resetLink) {
        try {
            Context context = new Context();
            context.setVariable("resetLink", resetLink);
            context.setVariable("year", Year.now().getValue());

            String html = templateEngine.process("email/password-reset", context);

            sendHtmlEmail(toEmail, "Password Reset", html);

            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }

    @Override
    @Async
    public CompletableFuture<Void> sendWelcomeEmailAsync(String toEmail, String fullName, String password, String companyName) {
        try {
            Context context = new Context();
            context.setVariable("email", toEmail);
            context.setVariable("fullName", fullName);
            context.setVariable("password", password);
            context.setVariable("companyName", companyName);
            context.setVariable("year", Year.now().getValue());

            String html = templateEngine.process("email/welcome", context);
            sendHtmlEmail(toEmail, "Welcome to " + companyName, html);

            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}", toEmail, e);
            return CompletableFuture.failedFuture(e);
        }
    }

    @Override
    @Async
    public CompletableFuture<Void> sendApplicationStatusUpdateEmailAsync(
            String toEmail,
            String fullName,
            String jobTitle,
            String newStatus,
            Instant interviewDateTime,
            String interviewLocation,
            String interviewMeetingLink,
            String note,
            String acceptLink,
            String rejectLink) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("jobTitle", jobTitle);
            context.setVariable("newStatus", newStatus);
            context.setVariable("interviewDateTime",
                    interviewDateTime == null ? null : interviewDateTime.atZone(ZoneId.systemDefault()).toLocalDateTime());
            context.setVariable("interviewLocation", interviewLocation);
            context.setVariable("interviewMeetingLink", interviewMeetingLink);
            context.setVariable("note", note);
            context.setVariable("acceptLink", acceptLink);
            context.setVariable("rejectLink", rejectLink);
            context.setVariable("year", Year.now().getValue());

            String templateName = switch (newStatus) {
                case "PENDING_INTERVIEW_SCHEDULE" -> "email/application-interview";
                case "OFFER" -> "email/application-offer";
                default -> throw new IllegalArgumentException("Unsupported application status email: " + newStatus);
            };

            String subject = switch (newStatus) {
                case "PENDING_INTERVIEW_SCHEDULE" -> "Interview Schedule - " + jobTitle;
                case "OFFER" -> "Job Offer - " + jobTitle;
                default -> "Application Status Update - " + jobTitle;
            };

            String html = templateEngine.process(templateName, context);
            sendHtmlEmail(toEmail, subject, html);

            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Failed to send application status update email to {}", toEmail, e);
            return CompletableFuture.failedFuture(e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            SystemConfig config = systemConfigService.getSystemConfigEntity();
            JavaMailSenderImpl dynamicSender  = new JavaMailSenderImpl();

            dynamicSender.setHost(config.getSmtpHost());
            dynamicSender.setPort(config.getSmtpPort());
            dynamicSender.setUsername(config.getSmtpUsername());
            dynamicSender.setPassword(config.getSmtpPassword());

            Properties props = dynamicSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.debug", "false");

            MimeMessage message = dynamicSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setFrom(config.getSmtpFromEmail());
            helper.setSubject(subject);
            helper.setText(html, true);

            dynamicSender.send(message);

            log.info("Email sent to {}", to);

        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED, "Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}
