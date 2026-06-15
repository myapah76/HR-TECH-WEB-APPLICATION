package sba301.hrtech.payment.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sba301.hrtech.payment.abstractions.services.IPaymentService;
import sba301.hrtech.payment.dtos.request.CreatePaymentRequest;
import sba301.hrtech.payment.dtos.response.CreatePaymentResponse;
import sba301.hrtech.shared.response.ApiResponse;
import vn.payos.model.webhooks.Webhook;


/**
 * Controller xử lý các yêu cầu liên quan đến thanh toán, bao gồm:
 * - Tạo link thanh toán (createPayment): Nhận yêu cầu từ client để tạo link thanh toán, trả về URL để client
 * chuyển hướng người dùng đến trang thanh toán của PayOS.
 * - Xử lý webhook (webhook): Nhận thông báo từ PayOS khi có sự kiện liên quan đến thanh toán
 * (thành công, thất bại, hủy), cập nhật trạng thái đơn hàng trong hệ thống.
 */
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

        log.info("Webhook payload: {}", webhook);

        paymentService.handleWebhook(webhook);

        return ResponseEntity.ok().build();
    }
}