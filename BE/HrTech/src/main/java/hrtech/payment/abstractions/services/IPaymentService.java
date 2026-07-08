package hrtech.payment.abstractions.services;

import org.springframework.data.domain.Page;
import hrtech.payment.dtos.request.CreatePaymentRequest;
import hrtech.payment.dtos.response.CreatePaymentResponse;
import hrtech.payment.dtos.response.PaymentResponse;
import vn.payos.model.webhooks.Webhook;

public interface IPaymentService {
    CreatePaymentResponse createPayment(CreatePaymentRequest request);

    void handleWebhook(Webhook webhook);

    PaymentResponse verifyPaymentStatus(Long orderCode);

    void reconcilePendingPayments();

    Page<PaymentResponse> getMyPaymentHistory(org.springframework.data.domain.Pageable pageable);
}
