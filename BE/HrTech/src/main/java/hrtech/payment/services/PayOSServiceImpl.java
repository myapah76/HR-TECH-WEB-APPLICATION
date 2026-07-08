package hrtech.payment.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import hrtech.payment.abstractions.services.IPayOSService;
import hrtech.payment.dtos.response.CreatePaymentResponse;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.system.abstractions.services.SystemConfigService;
import hrtech.system.entities.SystemConfig;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

@Service
@RequiredArgsConstructor
public class PayOSServiceImpl implements IPayOSService {

    private final SystemConfigService systemConfigService;

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
                    getPayOSClient().paymentRequests().create(request);

            return new CreatePaymentResponse(response.getCheckoutUrl());
        } catch (Exception e) {
            throw new AppException(
                    ErrorCode.HAS_ERROR,
                    "Lỗi khi tạo link thanh toán: " + e.getMessage());
        }
    }

    @Override
    public PayOS getPayOSClient() {
        SystemConfig config = systemConfigService.getSystemConfigEntity();
        return new PayOS(
                config.getPayosClientId(),
                config.getPayosApiKey(),
                config.getPayosChecksumKey()
        );
    }
}
