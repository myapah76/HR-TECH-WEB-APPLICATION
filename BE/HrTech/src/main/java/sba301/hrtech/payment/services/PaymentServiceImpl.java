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
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubscriptionRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubFeatureUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubFeatureUsageRepository;
import sba301.hrtech.subscription.entities.*;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;
import sba301.hrtech.subscription.entities.enums.SubscriptionType;
import vn.payos.PayOS;
import vn.payos.model.webhooks.Webhook;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final ISubscriptionPlanService subscriptionPlanService;
    private final IPayOSService payOSService;
    private final ISubscriptionService subscriptionService;
    private final CandidateSubscriptionRepository candidateSubscriptionRepository;
    private final CompanySubscriptionRepository companySubscriptionRepository;
    private final CandidateSubFeatureUsageRepository candidateSubFeatureUsageRepository;
    private final CompanySubFeatureUsageRepository companySubFeatureUsageRepository;
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
            log.info("data: ", data);
            if (!Boolean.TRUE.equals(webhook.getSuccess())) return;
            if (!"00".equals(webhook.getCode())) return;

            Long orderCode = data.getOrderCode();
            Payment payment = paymentRepository.findByOrderCode(orderCode)
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_CODE_NOT_FOUND, "Payment not found"));

            if (payment.getStatus() == PaymentStatus.PAID) return;

            payment.setStatus(PaymentStatus.PAID);
            payment.setPaymentLinkId(data.getPaymentLinkId());

            LocalDate now = LocalDate.now();

            if (payment.getSubscriptionType() == SubscriptionType.CANDIDATE) {
                CandidateSubscription sub = candidateSubscriptionRepository.findById(payment.getSubscriptionId())
                        .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Candidate Sub not found"));
                
                sub.setStatus(SubscriptionStatus.ACTIVE);
                LocalDate startDate = (sub.getEndDate() != null && sub.getEndDate().isAfter(now)) ? sub.getEndDate() : now;
                sub.setStartDate(startDate);
                sub.setEndDate(startDate.plusDays(sub.getPlan().getDurationDays()));
                candidateSubscriptionRepository.save(sub);

                if (sub.getPlan().getPlanFeatures() != null) {
                    for (CandidatePlanFeature pf : sub.getPlan().getPlanFeatures()) {
                        CandidateSubFeatureUsage usage = CandidateSubFeatureUsage.builder()
                                .subscription(sub)
                                .feature(pf.getFeature())
                                .quota(pf.getQuota())
                                .used(0)
                                .build();
                        candidateSubFeatureUsageRepository.save(usage);
                    }
                }

            } else if (payment.getSubscriptionType() == SubscriptionType.COMPANY) {
                CompanySubscription sub = companySubscriptionRepository.findById(payment.getSubscriptionId())
                        .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Company Sub not found"));

                sub.setStatus(SubscriptionStatus.ACTIVE);
                LocalDate startDate = (sub.getEndDate() != null && sub.getEndDate().isAfter(now)) ? sub.getEndDate() : now;
                sub.setStartDate(startDate);
                sub.setEndDate(startDate.plusDays(sub.getPlan().getDurationDays()));
                companySubscriptionRepository.save(sub);

                if (sub.getPlan().getPlanFeatures() != null) {
                    for (CompanyPlanFeature pf : sub.getPlan().getPlanFeatures()) {
                        CompanySubFeatureUsage usage = CompanySubFeatureUsage.builder()
                                .subscription(sub)
                                .feature(pf.getFeature())
                                .quota(pf.getQuota())
                                .used(0)
                                .build();
                        companySubFeatureUsageRepository.save(usage);
                    }
                }
            }

            paymentRepository.save(payment);
        } catch (Exception e) {
            throw new AppException(ErrorCode.WEBHOOK_NOT_FOUND, "Invalid PayOS webhook signature");
        }
    }
}
