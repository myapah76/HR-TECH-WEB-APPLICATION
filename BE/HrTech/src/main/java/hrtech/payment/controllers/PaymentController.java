package hrtech.payment.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.payment.abstractions.services.IPaymentService;
import hrtech.payment.dtos.request.CreatePaymentRequest;
import hrtech.payment.dtos.response.CreatePaymentResponse;
import hrtech.payment.dtos.response.PaymentResponse;
import hrtech.shared.response.ApiResponse;
import vn.payos.model.webhooks.Webhook;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Log4j2
public class PaymentController {

    private final IPaymentService paymentService;

    @PostMapping()
    public ApiResponse<CreatePaymentResponse> createPayment(
            @RequestBody CreatePaymentRequest createPaymentRequest
    ) {
        CreatePaymentResponse response = paymentService.createPayment(createPaymentRequest);
        return ApiResponse.success( response, "Payment created successfully");
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody Webhook webhook
            ) {
        paymentService.handleWebhook(webhook);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderCode}/verify")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PaymentResponse> verifyPayment(
            @PathVariable Long orderCode
    ) {
        PaymentResponse response = paymentService.verifyPaymentStatus(orderCode);
        return ApiResponse.success(response, "Payment verified successfully");
    }

    @GetMapping("/my-history")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Page<PaymentResponse>> getMyPaymentHistory(
            Pageable pageable
    ) {
        Page<PaymentResponse> response = paymentService.getMyPaymentHistory(pageable);
        return ApiResponse.success(response, "Payment history retrieved successfully");
    }
}