package sba301.hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.company.entities.enums.CompanyRole;
import sba301.hrtech.identity.abstractions.services.IUserService;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubscriptionRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionService;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubscriptionPlanRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubscriptionPlanRepository;
import sba301.hrtech.subscription.dtos.response.SubFeatureRateUsageResponse;
import sba301.hrtech.subscription.entities.*;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;
import sba301.hrtech.subscription.entities.enums.SubscriptionType;
import sba301.hrtech.subscription.abstractions.repositories.CandidateFeatureRateUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanyFeatureRateUsageRepository;
import sba301.hrtech.subscription.entities.CandidateFeatureRateUsage;
import sba301.hrtech.subscription.entities.CompanyFeatureRateUsage;
import sba301.hrtech.company.entities.Company;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import sba301.hrtech.subscription.dtos.response.MySubscriptionResponse;
import sba301.hrtech.subscription.dtos.response.SubFeatureUsageResponse;
import sba301.hrtech.identity.utils.AuthUtils;

@Service
@RequiredArgsConstructor
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
    private final CompanyRepository companyRepository;
    private final AuthUtils authUtils;

    @Override
    @Transactional
    public Object createPendingSubscription(UUID userId, UUID planId) {
        User user = userService.getUserEntityById(userId);
        Object planObj = subscriptionPlanService.getById(planId);
        Instant now = Instant.now();

        if (planObj instanceof CandidateSubscriptionPlan plan) {
            // Check renewal rules
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

            CandidateSubscription subscription = new CandidateSubscription();
            subscription.setUser(user);
            subscription.setPlan(plan);
            subscription.setStatus(SubscriptionStatus.PENDING);
            return candidateSubscriptionRepository.save(subscription);
        } else if (planObj instanceof CompanySubscriptionPlan plan) {
            CompanyMember member = companyService.getMemberEntityByUserId(userId);
            if (member.getCompanyRole() != CompanyRole.OWNER) {
                throw new AppException(ErrorCode.FORBIDDEN_ACTION,
                        "Only company owner can purchase a subscription plan");
            }

            Company company = member.getCompany();
            // Check renewal rules
            List<CompanySubscription> activeSubs = companySubscriptionRepository
                    .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            company.getId(), SubscriptionStatus.ACTIVE, now, now);
            if (!activeSubs.isEmpty()) {
                CompanySubscription activeSub = activeSubs.get(0);
                if (plan.getPrice() <= activeSub.getPlan().getPrice()) {
                    if (activeSub.getEndDate().isAfter(now)
                            && (company.getAiCreditBalance() > 0 || company.getJobPostBalance() > 0)) {
                        throw new AppException(ErrorCode.FORBIDDEN_ACTION,
                                "Bạn chỉ có thể mua/gia hạn khi gói hiện tại hết hạn hoặc hết Token");
                    }
                }
            }

            CompanySubscription subscription = new CompanySubscription();
            subscription.setCompany(company);
            subscription.setPurchasedBy(user);
            subscription.setPlan(plan);
            subscription.setStatus(SubscriptionStatus.PENDING);
            return companySubscriptionRepository.save(subscription);
        }

        throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription plan not found");
    }

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
                                        .map(CandidateFeatureRateUsage::getUsed).orElse(0);
                                return new SubFeatureRateUsageResponse(rl.getResetType(), rl.getCapQuota(), used,
                                        Instant.now());
                            }).collect(Collectors.toList());
                            return new SubFeatureUsageResponse(pf.getFeature().getCode(), pf.getFeature().getName(), 0,
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
                                            .map(CompanyFeatureRateUsage::getUsed).orElse(0);
                                    return new SubFeatureRateUsageResponse(rl.getResetType(), rl.getCapQuota(), used,
                                            Instant.now());
                                }).collect(Collectors.toList());
                                return new SubFeatureUsageResponse(pf.getFeature().getCode(), pf.getFeature().getName(),
                                        0, 0, rateUsages);
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
    @Transactional
    public void activateSubscription(UUID subscriptionId, SubscriptionType type) {
        Instant now = Instant.now();

        if (type == SubscriptionType.CANDIDATE) {
            CandidateSubscription sub = candidateSubscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Candidate Sub not found"));

            Instant newEndDate = now.plus(sub.getPlan().getDurationDays(), ChronoUnit.DAYS);

            // Cancel all currently active subscriptions for this user
            List<CandidateSubscription> activeSubs = candidateSubscriptionRepository
                    .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            sub.getUser().getId(), SubscriptionStatus.ACTIVE, now, now);
            for (CandidateSubscription activeSub : activeSubs) {
                if (!activeSub.getId().equals(sub.getId())) {
                    if (activeSub.getPlan().getId().equals(sub.getPlan().getId())) {
                        if (activeSub.getEndDate().isAfter(now)) {
                            newEndDate = activeSub.getEndDate().plus(sub.getPlan().getDurationDays(), ChronoUnit.DAYS);
                        }
                    }
                    activeSub.setStatus(SubscriptionStatus.CANCELLED);
                    candidateSubscriptionRepository.save(activeSub);
                }
            }

            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setStartDate(now);
            sub.setEndDate(newEndDate);
            candidateSubscriptionRepository.save(sub);

            // Add Tokens to Wallet
            if (sub.getPlan().getPlanFeatures() != null) {
                User user = sub.getUser();
                boolean walletChanged = false;
                for (CandidatePlanFeature pf : sub.getPlan().getPlanFeatures()) {
                    if ("AI_CREDIT".equals(pf.getFeature().getCode())) {
                        user.setAiCreditBalance(user.getAiCreditBalance() + pf.getTotalQuota());
                        walletChanged = true;
                    }
                }
                if (walletChanged) {
                    userService.saveUserEntity(user);
                }
            }
        } else if (type == SubscriptionType.COMPANY) {
            CompanySubscription sub = companySubscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Company Sub not found"));

            Instant newEndDate = now.plus(sub.getPlan().getDurationDays(), ChronoUnit.DAYS);

            // Cancel all currently active subscriptions for this company
            List<CompanySubscription> activeSubs = companySubscriptionRepository
                    .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            sub.getCompany().getId(), SubscriptionStatus.ACTIVE, now, now);
            for (CompanySubscription activeSub : activeSubs) {
                if (!activeSub.getId().equals(sub.getId())) {
                    if (activeSub.getPlan().getId().equals(sub.getPlan().getId())) {
                        if (activeSub.getEndDate().isAfter(now)) {
                            newEndDate = activeSub.getEndDate().plus(sub.getPlan().getDurationDays(), ChronoUnit.DAYS);
                        }
                    }
                    activeSub.setStatus(SubscriptionStatus.CANCELLED);
                    companySubscriptionRepository.save(activeSub);
                }
            }

            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setStartDate(now);
            sub.setEndDate(newEndDate);
            companySubscriptionRepository.save(sub);

            // Add Tokens to Wallet
            if (sub.getPlan().getPlanFeatures() != null) {
                Company company = sub.getCompany();
                boolean walletChanged = false;
                for (CompanyPlanFeature pf : sub.getPlan().getPlanFeatures()) {
                    if ("AI_CREDIT".equals(pf.getFeature().getCode())) {
                        company.setAiCreditBalance(company.getAiCreditBalance() + pf.getTotalQuota());
                        walletChanged = true;
                    } else if ("JOB_POSTING".equals(pf.getFeature().getCode())) {
                        company.setJobPostBalance(company.getJobPostBalance() + pf.getTotalQuota());
                        walletChanged = true;
                    }
                }
                if (walletChanged) {
                    companyRepository.save(company);
                }
            }
        }
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
        if (freePlan.getPlanFeatures() != null) {
            boolean walletChanged = false;
            for (CandidatePlanFeature pf : freePlan.getPlanFeatures()) {
                if ("AI_CREDIT".equals(pf.getFeature().getCode())) {
                    user.setAiCreditBalance(user.getAiCreditBalance() + pf.getTotalQuota());
                    walletChanged = true;
                }
            }
            if (walletChanged) {
                userService.saveUserEntity(user);
            }
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

        Company company = companyRepository.findById(companyId).orElse(null);
        if (company == null)
            return;

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
        if (freePlan.getPlanFeatures() != null) {
            boolean walletChanged = false;
            for (CompanyPlanFeature pf : freePlan.getPlanFeatures()) {
                if ("AI_CREDIT".equals(pf.getFeature().getCode())) {
                    company.setAiCreditBalance(company.getAiCreditBalance() + pf.getTotalQuota());
                    walletChanged = true;
                } else if ("JOB_POSTING".equals(pf.getFeature().getCode())) {
                    company.setJobPostBalance(company.getJobPostBalance() + pf.getTotalQuota());
                    walletChanged = true;
                }
            }
            if (walletChanged) {
                companyRepository.save(company);
            }
        }
    }

    @Override
    public UUID getSubscriptionPlanId(UUID subscriptionId, SubscriptionType type) {
        if (type == SubscriptionType.CANDIDATE) {
            return candidateSubscriptionRepository.findById(subscriptionId)
                    .map(sub -> sub.getPlan().getId())
                    .orElse(null);
        } else if (type == SubscriptionType.COMPANY) {
            return companySubscriptionRepository.findById(subscriptionId)
                    .map(sub -> sub.getPlan().getId())
                    .orElse(null);
        }
        return null;
    }
}