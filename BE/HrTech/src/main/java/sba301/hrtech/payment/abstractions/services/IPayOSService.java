package sba301.hrtech.payment.abstractions.services;

import sba301.hrtech.payment.dtos.response.CreatePaymentResponse;

public interface IPayOSService {
    CreatePaymentResponse createPaymentLink(
            Long orderCode,
            Long amount,
            String planName);
}