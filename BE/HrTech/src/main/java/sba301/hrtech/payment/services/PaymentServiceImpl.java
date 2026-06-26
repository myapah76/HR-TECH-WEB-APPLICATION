package sba301.hrtech.payment.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.utils.AuthUtils;
import sba301.hrtech.payment.abstractions.repositories.PaymentRepository;
import sba301.hrtech.payment.abstractions.services.IPayOSService;
import sba301.hrtech.payment.abstractions.services.IPaymentService;
import sba301.hrtech.payment.dtos.request.CreatePaymentRequest;
import sba301.hrtech.payment.dtos.response.CreatePaymentResponse;
import sba301.hrtech.payment.entities.Payment;
import sba301.hrtech.payment.entities.enums.PaymentStatus;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionService;
import sba301.hrtech.subscription.entities.*;
import sba301.hrtech.subscription.entities.enums.SubscriptionType;
import sba301.hrtech.payment.dtos.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.payos.PayOS;
import vn.payos.model.webhooks.Webhook;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final ISubscriptionPlanService subscriptionPlanService;
    private final IPayOSService payOSService;
    private final ISubscriptionService subscriptionService;
    private final PaymentRepository paymentRepository;
    private final AuthUtils authUtils;
    private final PayOS payOS;

    @Override
    @Transactional
    public CreatePaymentResponse createPayment(CreatePaymentRequest request) {
        User user = authUtils.getCurrentUser();
        Object planObj = subscriptionPlanService.getById(request.subscriptionPlanId());
        
        Long price = 0L;
        String name = "";
        SubscriptionType type = null;
        UUID subscriptionId = null;

        Object subscriptionObj = subscriptionService.createPendingSubscription(user.getId(), request.subscriptionPlanId());

        if (planObj instanceof CandidateSubscriptionPlan plan) {
            price = plan.getPrice();
            name = plan.getName();
            type = SubscriptionType.CANDIDATE;
            subscriptionId = ((CandidateSubscription) subscriptionObj).getId();
        } else if (planObj instanceof CompanySubscriptionPlan plan) {
            price = plan.getPrice();
            name = plan.getName();
            type = SubscriptionType.COMPANY;
            subscriptionId = ((CompanySubscription) subscriptionObj).getId();
        }

        Payment payment = new Payment();
        payment.setOrderCode(System.currentTimeMillis());
        payment.setAmount(price);
        payment.setSubscriptionId(subscriptionId);
        payment.setSubscriptionType(type);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setUser(user);
        paymentRepository.save(payment);

        return payOSService.createPaymentLink(payment.getOrderCode(), payment.getAmount(), name);
    }

    @Transactional
    @Override
    public void handleWebhook(Webhook webhook) {
        try {
            var data = payOS.webhooks().verify(webhook);
            log.info("Received PayOS webhook: {}", data);
            if (!Boolean.TRUE.equals(webhook.getSuccess())) return;
            if (!"00".equals(webhook.getCode())) return;

            Long orderCode = data.getOrderCode();
            Payment payment = paymentRepository.findByOrderCode(orderCode)
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_CODE_NOT_FOUND, "Payment not found"));

            if (payment.getStatus() == PaymentStatus.PAID) return;

            payment.setStatus(PaymentStatus.PAID);
            payment.setPaymentLinkId(data.getPaymentLinkId());

            subscriptionService.activateSubscription(payment.getSubscriptionId(), payment.getSubscriptionType());

            paymentRepository.save(payment);
        } catch (Exception e) {
            throw new AppException(ErrorCode.WEBHOOK_NOT_FOUND, "Invalid PayOS webhook signature");
        }
    }

    @Override
    public Page<PaymentResponse> getMyPaymentHistory(Pageable pageable) {
        UUID userId = authUtils.getCurrentUserId();
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(payment -> {
                String subName = subscriptionService.getSubscriptionPlanName(payment.getSubscriptionId(), payment.getSubscriptionType());
                return new PaymentResponse(
                    payment.getOrderCode(),
                    payment.getAmount(),
                    payment.getStatus(),
                    subName,
                    payment.getCreatedAt()
                );
            });
    }
}
