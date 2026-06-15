package sba301.hrtech.payment.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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
import sba301.hrtech.subscription.entities.Subscription;
import sba301.hrtech.subscription.entities.SubscriptionPlan;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;
import vn.payos.PayOS;
import vn.payos.model.webhooks.Webhook;

import java.time.LocalDate;
import java.util.UUID;

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
    public CreatePaymentResponse createPayment(
            CreatePaymentRequest request
    ) {
        UUID userId = authUtils.getCurrentUserId();
        SubscriptionPlan plan = subscriptionPlanService.getById(request.subscriptionPlanId());

        Subscription subscription = subscriptionService.createPendingSubscription(userId, plan.getId());

        Payment payment = new Payment();
        payment.setOrderCode(System.currentTimeMillis());
        payment.setAmount(plan.getPrice());
        payment.setSubscription(subscription);
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        return payOSService.createPaymentLink(payment.getOrderCode(), payment.getAmount(), plan.getName());
    }

    @Transactional
    @Override
    public void handleWebhook(
            Webhook webhook
    ) {
        try{
            var data = payOS.webhooks().verify(webhook);

            if (!Boolean.TRUE.equals(webhook.getSuccess())) {
                return;
            }

            if (!"00".equals(webhook.getCode())) {
                return;
            }

            Long orderCode = data.getOrderCode();

            Payment payment =
                    paymentRepository
                            .findByOrderCode(orderCode)
                            .orElseThrow(() ->
                                    new AppException(
                                            ErrorCode.ORDER_CODE_NOT_FOUND,
                                            "Không tìm thấy payment với order code: " + orderCode)
                            );

            // webhook có thể gửi nhiều lần
            if (payment.getStatus() == PaymentStatus.PAID) {
                return;
            }
            // update payment
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaymentLinkId(data.getPaymentLinkId());
            // update subscription
            Subscription subscription = payment.getSubscription();
            LocalDate now = LocalDate.now();
            subscription.setStatus(
                    SubscriptionStatus.ACTIVE
            );
            LocalDate startDate;
            if (
                    subscription.getEndDate() != null &&
                            subscription.getEndDate().isAfter(now)
            ) {
                startDate = subscription.getEndDate();
            } else {
                startDate = now;
            }
            subscription.setStartDate(startDate);
            subscription.setEndDate(
                    startDate.plusDays(
                            subscription.getPlan()
                                    .getDurationDays()
                    )
            );
            paymentRepository.save(payment);
        } catch (Exception e) {
            throw new AppException(
                    ErrorCode.WEBHOOK_NOT_FOUND,
                    "Invalid PayOS webhook signature");
        }
    }
}
