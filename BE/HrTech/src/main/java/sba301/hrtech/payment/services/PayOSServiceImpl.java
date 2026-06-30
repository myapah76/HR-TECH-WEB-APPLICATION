package sba301.hrtech.payment.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sba301.hrtech.payment.abstractions.services.IPayOSService;
import sba301.hrtech.payment.dtos.response.CreatePaymentResponse;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

@Service
@RequiredArgsConstructor
public class PayOSServiceImpl implements IPayOSService {

    private final PayOS payOS;

    @Override
    public CreatePaymentResponse createPaymentLink(
            Long orderCode,
            Long amount,
            String planName
    ) {
        try {
            CreatePaymentLinkRequest request =
                    CreatePaymentLinkRequest.builder()
                            .orderCode(orderCode)
                            .amount(amount)
                            .description(planName)
                            .returnUrl("http://localhost:3000/pricing")
                            .cancelUrl("http://localhost:3000/pricing")
                            .item(
                                    PaymentLinkItem.builder()
                                            .name(planName)
                                            .price(amount)
                                            .quantity(1)
                                            .build()
                            )
                            .build();

            CreatePaymentLinkResponse response =
                    payOS.paymentRequests().create(request);

            return new CreatePaymentResponse(response.getCheckoutUrl());
        } catch (Exception e) {
            throw new AppException(
                    ErrorCode.HAS_ERROR,
                    "Lỗi khi tạo link thanh toán: " + e.getMessage());
        }
    }
}
