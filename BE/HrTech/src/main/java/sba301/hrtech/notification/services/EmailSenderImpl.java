package sba301.hrtech.notification.services;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;
import sba301.hrtech.notification.abstractions.IEmailSender;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSenderImpl implements IEmailSender {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Override
    @Async
    public CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp) {

        try {
            Context context = new Context();
            context.setVariable("otp", otp);
            context.setVariable("year", LocalDateTime.now().getYear());
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
            context.setVariable("year", LocalDateTime.now().getYear());

            String html = templateEngine.process("email/password-reset", context);

            sendHtmlEmail(toEmail, "Password Reset", html);

            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setFrom(fromEmail);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);

            log.info("Email sent to {}", to);

        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED, "Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}
