package sba301.hrtech.payment.abstractions.services;

import sba301.hrtech.payment.dtos.request.CreatePaymentRequest;
import sba301.hrtech.payment.dtos.response.CreatePaymentResponse;
import vn.payos.model.webhooks.Webhook;

public interface IPaymentService {
    CreatePaymentResponse createPayment(CreatePaymentRequest request);
    void handleWebhook(Webhook webhook);
}
