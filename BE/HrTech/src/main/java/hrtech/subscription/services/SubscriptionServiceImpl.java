package hrtech.subscription.services;

import hrtech.subscription.entities.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.company.entities.CompanyMember;
import hrtech.company.entities.enums.CompanyRole;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.identity.entities.User;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.subscription.abstractions.repositories.CandidateSubscriptionRepository;
import hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;
import hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import hrtech.subscription.abstractions.services.ISubscriptionService;
import hrtech.subscription.abstractions.repositories.CandidateSubscriptionPlanRepository;
import hrtech.subscription.abstractions.repositories.CompanySubscriptionPlanRepository;
import hrtech.subscription.dtos.response.SubFeatureRateUsageResponse;
import hrtech.subscription.entities.enums.SubscriptionStatus;
import hrtech.subscription.entities.enums.SubscriptionType;
import hrtech.subscription.abstractions.repositories.CandidateFeatureRateUsageRepository;
import hrtech.subscription.abstractions.repositories.CompanyFeatureRateUsageRepository;
import hrtech.company.entities.Company;
import org.springframework.transaction.annotation.Transactional;
import hrtech.notification.abstractions.services.INotificationService;
import hrtech.notification.entities.enums.NotificationType;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import hrtech.subscription.dtos.response.MySubscriptionResponse;
import hrtech.subscription.dtos.response.SubFeatureUsageResponse;
import hrtech.identity.utils.AuthUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionServiceImpl implements ISubscriptionService {

    private final IUserService userService;
    private final ISubscriptionPlanService subscriptionPlanService;

    private final CandidateSubscriptionRepository candidateSubscriptionRepository;
    private final CompanySubscriptionRepository companySubscriptionRepository;
    private final CandidateSubscriptionPlanRepository candidateSubscriptionPlanRepository;
    private final CompanySubscriptionPlanRepository companySubscriptionPlanRepository;
    private final CandidateFeatureRateUsageRepository CandidateFeatureRateUsageRepository;
    private final CompanyFeatureRateUsageRepository companyFeatureRateUsageRepository;
    private final ICompanyService companyService;
    private final AuthUtils authUtils;
    private final INotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public MySubscriptionResponse getMyCurrentSubscription() {
        UUID userId = authUtils.getCurrentUserId();
        User user = userService.getUserEntityById(userId);

        if (user.getRole().getName().equals("CANDIDATE")) {
            List<CandidateSubscription> subs = candidateSubscriptionRepository
                    .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            userId, SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());
            if (!subs.isEmpty()) {
                CandidateSubscription sub = subs.get(0);
                List<SubFeatureUsageResponse> usage = sub.getPlan().getPlanFeatures().stream()
                        .map(pf -> {
                            List<SubFeatureRateUsageResponse> rateUsages = pf.getRateLimits().stream().map(rl -> {
                                int used = CandidateFeatureRateUsageRepository
                                        .findByUserIdAndFeatureCodeAndResetType(userId, pf.getFeature().getCode(),
                                                rl.getResetType())
                                        .map(u -> u.getUsed()).orElse(0);
                                return new SubFeatureRateUsageResponse(rl.getResetType(), rl.getCapQuota(), used,
                                        Instant.now());
                            }).collect(Collectors.toList());
                            return new SubFeatureUsageResponse(pf.getFeature().getCode(), pf.getFeature().getName(), pf.getAiCreditCost(),
                                    0, rateUsages);
                        }).collect(Collectors.toList());
                return new MySubscriptionResponse(
                        sub.getId(), sub.getPlan().getId(), sub.getPlan().getName(), sub.getPlan().getPrice(),
                        sub.getStatus(), sub.getStartDate(), sub.getEndDate(),

                        user.getAiCreditBalance(), 0, usage);
            }
        } else {
            CompanyMember member = companyService.getMemberEntityByUserId(userId);
            if (member != null && member.getCompany() != null) {
                Company company = member.getCompany();
                List<CompanySubscription> subs = companySubscriptionRepository
                        .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                company.getId(), SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());
                if (!subs.isEmpty()) {
                    CompanySubscription sub = subs.get(0);
                    List<SubFeatureUsageResponse> usage = sub.getPlan().getPlanFeatures().stream()
                            .map(pf -> {
                                List<SubFeatureRateUsageResponse> rateUsages = pf.getRateLimits().stream().map(rl -> {
                                    int used = companyFeatureRateUsageRepository
                                            .findByCompanyIdAndFeatureCodeAndResetType(company.getId(),
                                                    pf.getFeature().getCode(), rl.getResetType())
                                            .map(u -> u.getUsed()).orElse(0);
                                    return new SubFeatureRateUsageResponse(rl.getResetType(), rl.getCapQuota(), used,
                                            Instant.now());
                                }).collect(Collectors.toList());
                                return new SubFeatureUsageResponse(pf.getFeature().getCode(), pf.getFeature().getName(),
                                        pf.getAiCreditCost(), 0, rateUsages);
                            }).collect(Collectors.toList());
                    return new MySubscriptionResponse(
                            sub.getId(), sub.getPlan().getId(), sub.getPlan().getName(), sub.getPlan().getPrice(),
                            sub.getStatus(), sub.getStartDate(), sub.getEndDate(),
                            company.getAiCreditBalance(), company.getJobPostBalance(), usage);
                }
            }
        }
        return null;
    }

    @Override
    public String getSubscriptionPlanName(UUID subscriptionId, SubscriptionType type) {
        if (type == SubscriptionType.CANDIDATE) {
            return candidateSubscriptionRepository.findById(subscriptionId)
                    .map(sub -> sub.getPlan().getName())
                    .orElse("Unknown Plan");
        } else if (type == SubscriptionType.COMPANY) {
            return companySubscriptionRepository.findById(subscriptionId)
                    .map(sub -> sub.getPlan().getName())
                    .orElse("Unknown Plan");
        }
        return "Unknown Plan";
    }

    /**
     * Tìm gói Free (price = 0) của Candidate, tạo và kích hoạt ngay.
     * Idempotent: nếu user đã có subscription ACTIVE thì bỏ qua.
     */
    @Override
    @Transactional
    public void createAndActivateFreeSubscription(UUID userId) {
        Instant now = Instant.now();
        boolean alreadyActive = !candidateSubscriptionRepository
                .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        userId, SubscriptionStatus.ACTIVE, now, now)
                .isEmpty();
        if (alreadyActive)
            return;

        CandidateSubscriptionPlan freePlan = candidateSubscriptionPlanRepository
                .findFirstByPriceAndIsActiveTrue(0L)
                .orElse(null);
        if (freePlan == null)
            return;

        User user = userService.getUserEntityById(userId);
        CandidateSubscription sub = new CandidateSubscription();
        sub.setUser(user);
        sub.setPlan(freePlan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartDate(now);
        long duration = freePlan.getDurationDays() > 0 ? freePlan.getDurationDays() : 36500L;
        sub.setEndDate(now.plus(duration, ChronoUnit.DAYS));
        candidateSubscriptionRepository.save(sub);

        // Add Tokens to Wallet
        if (freePlan.getAiCreditBalance() != null && freePlan.getAiCreditBalance() > 0) {
            user.setAiCreditBalance(user.getAiCreditBalance() + freePlan.getAiCreditBalance());
            userService.saveUserEntity(user);
        }
    }

    /**
     * Tìm gói Free (price = 0) của Company, tạo và kích hoạt ngay.
     * Idempotent: nếu company đã có subscription ACTIVE thì bỏ qua.
     */
    @Override
    @Transactional
    public void createAndActivateFreeCompanySubscription(UUID companyId, UUID userId) {
        Instant now = Instant.now();
        boolean alreadyActive = !companySubscriptionRepository
                .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        companyId, SubscriptionStatus.ACTIVE, now, now)
                .isEmpty();
        if (alreadyActive)
            return;

        CompanySubscriptionPlan freePlan = companySubscriptionPlanRepository
                .findFirstByPriceAndIsActiveTrue(0L)
                .orElse(null);
        if (freePlan == null)
            return;

        Company company = companyService.getCompanyEntityById(companyId);

        User purchasedBy = userService.getUserEntityById(userId);

        CompanySubscription sub = new CompanySubscription();
        sub.setCompany(company);
        sub.setPlan(freePlan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartDate(now);
        long duration = freePlan.getDurationDays() > 0 ? freePlan.getDurationDays() : 36500L;
        sub.setEndDate(now.plus(duration, ChronoUnit.DAYS));
        sub.setPurchasedBy(purchasedBy);
        companySubscriptionRepository.save(sub);

        // Add Tokens to Wallet
        int aiCreditDelta = freePlan.getAiCreditBalance() != null ? freePlan.getAiCreditBalance() : 0;
        int jobPostDelta = freePlan.getJobPostBalance() != null ? freePlan.getJobPostBalance() : 0;
        if (aiCreditDelta != 0 || jobPostDelta != 0) {
            companyService.updateCompanyBalances(company.getId(), aiCreditDelta, jobPostDelta);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void checkRenewalEligibility(UUID userId, UUID planId) {
        User user = userService.getUserEntityById(userId);
        Object planObj = subscriptionPlanService.getById(planId);
        Instant now = Instant.now();

        if (planObj instanceof CandidateSubscriptionPlan plan) {
            List<CandidateSubscription> activeSubs = candidateSubscriptionRepository
                    .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            userId, SubscriptionStatus.ACTIVE, now, now);
            if (!activeSubs.isEmpty()) {
                CandidateSubscription activeSub = activeSubs.get(0);
                if (plan.getPrice() <= activeSub.getPlan().getPrice()) {
                    if (activeSub.getEndDate().isAfter(now) && user.getAiCreditBalance() > 0) {
                        throw new AppException(ErrorCode.FORBIDDEN_ACTION,
                                "Bạn chỉ có thể mua/gia hạn khi gói hiện tại hết hạn hoặc hết Token");
                    }
                }
            }
        } else if (planObj instanceof CompanySubscriptionPlan plan) {
            CompanyMember member = companyService.getMemberEntityByUserId(userId);
            if (member.getCompanyRole() != CompanyRole.OWNER) {
                throw new AppException(ErrorCode.FORBIDDEN_ACTION,
                        "Only company owner can purchase a subscription plan");
            }

            Company company = member.getCompany();
            List<CompanySubscription> activeSubs = companySubscriptionRepository
                    .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            company.getId(), SubscriptionStatus.ACTIVE, now, now);
            if (!activeSubs.isEmpty()) {
                CompanySubscription activeSub = activeSubs.get(0);
                if (plan.getPrice() <= activeSub.getPlan().getPrice()) {
                    if (activeSub.getEndDate().isAfter(now) && company.getAiCreditBalance() > 0) {
                        throw new AppException(ErrorCode.FORBIDDEN_ACTION,
                                "Bạn chỉ có thể mua/gia hạn khi gói hiện tại hết hạn hoặc hết Token");
                    }
                }
            }
        } else {
            throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription plan not found");
        }
    }

    @Override
    @Transactional
    public void createAndActivateSubscription(UUID userId, UUID planId, SubscriptionType type) {
        Instant now = Instant.now();
        Object planObj = subscriptionPlanService.getById(planId);

        if (type == SubscriptionType.CANDIDATE && planObj instanceof CandidateSubscriptionPlan plan) {
            User user = userService.getUserEntityById(userId);

            Instant newEndDate = now.plus(plan.getDurationDays(), ChronoUnit.DAYS);

            // Hủy tất cả các gói cước đang ACTIVE cùng loại
            List<CandidateSubscription> activeSubs = candidateSubscriptionRepository
                    .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            userId, SubscriptionStatus.ACTIVE, now, now);
            for (CandidateSubscription activeSub : activeSubs) {
                if (activeSub.getPlan().getId().equals(plan.getId())) {
                    if (activeSub.getEndDate().isAfter(now)) {
                        newEndDate = activeSub.getEndDate().plus(plan.getDurationDays(), ChronoUnit.DAYS);
                    }
                }
                activeSub.setStatus(SubscriptionStatus.CANCELLED);
                candidateSubscriptionRepository.save(activeSub);
            }

            // Tạo mới Subscription với trạng thái ACTIVE trực tiếp
            CandidateSubscription sub = new CandidateSubscription();
            sub.setUser(user);
            sub.setPlan(plan);
            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setStartDate(now);
            sub.setEndDate(newEndDate);
            CandidateSubscription savedSub = candidateSubscriptionRepository.save(sub);

            // Nạp Token vào ví của User
            if (plan.getAiCreditBalance() != null && plan.getAiCreditBalance() > 0) {
                user.setAiCreditBalance(user.getAiCreditBalance() + plan.getAiCreditBalance());
                userService.saveUserEntity(user);
            }

            // Gửi thông báo hệ thống
            try {
                notificationService.createAndSendNotification(
                        userId,
                        "Nâng cấp tài khoản thành công",
                        "Tài khoản của bạn đã được nâng cấp thành công lên gói " + plan.getName() + ".",
                        NotificationType.SUBSCRIPTION_UPGRADED,
                        savedSub.getId().toString());
            } catch (Exception e) {
                // log error
            }
        } else if (type == SubscriptionType.COMPANY && planObj instanceof CompanySubscriptionPlan plan) {
            CompanyMember member = companyService.getMemberEntityByUserId(userId);
            Company company = member.getCompany();
            User user = userService.getUserEntityById(userId);

            Instant newEndDate = now.plus(plan.getDurationDays(), ChronoUnit.DAYS);

            // Hủy tất cả các gói cước đang ACTIVE của công ty
            List<CompanySubscription> activeSubs = companySubscriptionRepository
                    .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            company.getId(), SubscriptionStatus.ACTIVE, now, now);
            for (CompanySubscription activeSub : activeSubs) {
                if (activeSub.getPlan().getId().equals(plan.getId())) {
                    if (activeSub.getEndDate().isAfter(now)) {
                        newEndDate = activeSub.getEndDate().plus(plan.getDurationDays(), ChronoUnit.DAYS);
                    }
                }
                activeSub.setStatus(SubscriptionStatus.CANCELLED);
                companySubscriptionRepository.save(activeSub);
            }

            // Tạo mới Subscription với trạng thái ACTIVE trực tiếp
            CompanySubscription sub = new CompanySubscription();
            sub.setCompany(company);
            sub.setPurchasedBy(user);
            sub.setPlan(plan);
            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setStartDate(now);
            sub.setEndDate(newEndDate);
            CompanySubscription savedSub = companySubscriptionRepository.save(sub);

            // Nạp Token vào ví của công ty
            int aiCreditDelta = plan.getAiCreditBalance() != null ? plan.getAiCreditBalance() : 0;
            int jobPostDelta = plan.getJobPostBalance() != null ? plan.getJobPostBalance() : 0;
            if (aiCreditDelta != 0 || jobPostDelta != 0) {
                companyService.updateCompanyBalances(company.getId(), aiCreditDelta, jobPostDelta);
            }

            // Gửi thông báo hệ thống
            try {
                notificationService.createAndSendNotification(
                        userId,
                        "Nâng cấp gói doanh nghiệp thành công",
                        "Doanh nghiệp " + company.getName() + " đã được nâng cấp lên gói " + plan.getName() + ".",
                        NotificationType.SUBSCRIPTION_UPGRADED,
                        savedSub.getId().toString());
            } catch (Exception e) {
                // log error
            }
        }
    }
}