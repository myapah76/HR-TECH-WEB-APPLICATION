package sba301.hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.company.entities.enums.CompanyRole;
import sba301.hrtech.identity.abstractions.services.IUserService;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubFeatureUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubscriptionRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubFeatureUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionService;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubFeatureRateUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubFeatureRateUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubscriptionPlanRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubscriptionPlanRepository;
import sba301.hrtech.subscription.dtos.response.SubFeatureRateUsageResponse;
import sba301.hrtech.subscription.entities.*;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;
import sba301.hrtech.subscription.entities.enums.SubscriptionType;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final CandidateSubFeatureUsageRepository candidateSubFeatureUsageRepository;
    private final CompanySubFeatureUsageRepository companySubFeatureUsageRepository;
    private final CandidateSubFeatureRateUsageRepository candidateSubFeatureRateUsageRepository;
    private final CompanySubFeatureRateUsageRepository companySubFeatureRateUsageRepository;
    private final CandidateSubscriptionPlanRepository candidateSubscriptionPlanRepository;
    private final CompanySubscriptionPlanRepository companySubscriptionPlanRepository;
    private final ICompanyService companyService;
    private final AuthUtils authUtils;

    @Override
    public Object createPendingSubscription(UUID userId, UUID planId) {
        User user = userService.getUserEntityById(userId);
        Object planObj = subscriptionPlanService.getById(planId);

        if (planObj instanceof CandidateSubscriptionPlan plan) {
            CandidateSubscription subscription = new CandidateSubscription();
            subscription.setUser(user);
            subscription.setPlan(plan);
            subscription.setStatus(SubscriptionStatus.PENDING);
            return candidateSubscriptionRepository.save(subscription);
        } else if (planObj instanceof CompanySubscriptionPlan plan) {
            CompanyMember member = companyService.getMemberEntityByUserId(userId);
            
            if (member.getCompanyRole() != CompanyRole.OWNER) {
                throw new AppException(ErrorCode.FORBIDDEN_ACTION, "Only company owner can purchase a subscription plan");
            }
            
            CompanySubscription subscription = new CompanySubscription();
            subscription.setCompany(member.getCompany());
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
                List<SubFeatureUsageResponse> usage = candidateSubFeatureUsageRepository.findBySubscriptionId(sub.getId())
                        .stream().map(u -> new SubFeatureUsageResponse(
                                u.getFeature().getCode(), 
                                u.getFeature().getName(), 
                                u.getTotalQuota(), 
                                u.getTotalUsed(),
                                u.getRateUsages().stream()
                                        .map(ru -> new SubFeatureRateUsageResponse(
                                                ru.getResetType(), ru.getCapQuota(), ru.getUsed(), ru.getLastResetDate()
                                        )).collect(Collectors.toList())
                        ))
                        .collect(Collectors.toList());
                return new MySubscriptionResponse(
                        sub.getId(),
                        sub.getPlan().getId(),
                        sub.getPlan().getName(),
                        sub.getPlan().getPrice(),
                        sub.getStatus(),
                        sub.getStartDate(),
                        sub.getEndDate(),
                        usage);
            }
        } else {
            CompanyMember member = companyService.getMemberEntityByUserId(userId);
            if (member != null && member.getCompany() != null) {
                List<CompanySubscription> subs = companySubscriptionRepository
                        .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                member.getCompany().getId(), SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());
                if (!subs.isEmpty()) {
                    CompanySubscription sub = subs.get(0);
                    List<SubFeatureUsageResponse> usage = companySubFeatureUsageRepository.findBySubscriptionId(sub.getId())
                        .stream().map(u -> new SubFeatureUsageResponse(
                                u.getFeature().getCode(), 
                                u.getFeature().getName(), 
                                u.getTotalQuota(), 
                                u.getTotalUsed(),
                                u.getRateUsages().stream()
                                        .map(ru -> new SubFeatureRateUsageResponse(
                                                ru.getResetType(), ru.getCapQuota(), ru.getUsed(), ru.getLastResetDate()
                                        )).collect(Collectors.toList())
                        ))
                        .collect(Collectors.toList());
                    return new MySubscriptionResponse(
                            sub.getId(),
                            sub.getPlan().getId(),
                            sub.getPlan().getName(),
                            sub.getPlan().getPrice(),
                            sub.getStatus(),
                            sub.getStartDate(),
                            sub.getEndDate(),
                            usage);
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
            Map<UUID, Integer> remainingQuotas = new HashMap<>();
            Instant trimQuotaAt = null;

            // CLEAN SLATE: Cancel all currently active subscriptions for this user
            List<CandidateSubscription> activeSubs = candidateSubscriptionRepository
                    .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            sub.getUser().getId(), SubscriptionStatus.ACTIVE, now, now);
            for (CandidateSubscription activeSub : activeSubs) {
                if (!activeSub.getId().equals(sub.getId())) {
                    if (activeSub.getPlan().getId().equals(sub.getPlan().getId())) {
                        if (activeSub.getEndDate().isAfter(now)) {
                            newEndDate = activeSub.getEndDate().plus(sub.getPlan().getDurationDays(), ChronoUnit.DAYS);
                            trimQuotaAt = activeSub.getEndDate();
                        }
                        List<CandidateSubFeatureUsage> oldUsages = candidateSubFeatureUsageRepository.findBySubscriptionId(activeSub.getId());
                        for (CandidateSubFeatureUsage oldUsage : oldUsages) {
                            int remaining = oldUsage.getTotalQuota() - oldUsage.getTotalUsed();
                            if (remaining > 0) {
                                remainingQuotas.put(oldUsage.getFeature().getId(), remaining);
                            }
                        }
                    }
                    activeSub.setStatus(SubscriptionStatus.CANCELLED);
                    candidateSubscriptionRepository.save(activeSub);
                }
            }

            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setStartDate(now);
            sub.setEndDate(newEndDate);
            if (trimQuotaAt != null) {
                sub.setTrimQuotaAt(trimQuotaAt);
                sub.setIsQuotaTrimmed(false);
            }
            candidateSubscriptionRepository.save(sub);

            if (sub.getPlan().getPlanFeatures() != null) {
                for (CandidatePlanFeature pf : sub.getPlan().getPlanFeatures()) {
                    int extraQuota = remainingQuotas.getOrDefault(pf.getFeature().getId(), 0);
                    CandidateSubFeatureUsage usage = CandidateSubFeatureUsage.builder()
                            .subscription(sub)
                            .feature(pf.getFeature())
                            .totalQuota(pf.getTotalQuota() + extraQuota)
                            .totalUsed(0)
                            .build();
                    candidateSubFeatureUsageRepository.save(usage);

                    // Create rate usage rows (daily/weekly caps)
                    for (CandidatePlanFeatureRateLimit rl : pf.getRateLimits()) {
                        CandidateSubFeatureRateUsage rateUsage = CandidateSubFeatureRateUsage.builder()
                                .usage(usage)
                                .resetType(rl.getResetType())
                                .capQuota(rl.getCapQuota())
                                .used(0)
                                .lastResetDate(now)
                                .build();
                        candidateSubFeatureRateUsageRepository.save(rateUsage);
                    }
                }
            }

        } else if (type == SubscriptionType.COMPANY) {
            CompanySubscription sub = companySubscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Company Sub not found"));

            Instant newEndDate = now.plus(sub.getPlan().getDurationDays(), ChronoUnit.DAYS);
            Map<UUID, Integer> remainingQuotas = new HashMap<>();
            Instant trimQuotaAt = null;

            // CLEAN SLATE: Cancel all currently active subscriptions for this company
            List<CompanySubscription> activeSubs = companySubscriptionRepository
                    .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            sub.getCompany().getId(), SubscriptionStatus.ACTIVE, now, now);
            for (CompanySubscription activeSub : activeSubs) {
                if (!activeSub.getId().equals(sub.getId())) {
                    if (activeSub.getPlan().getId().equals(sub.getPlan().getId())) {
                        if (activeSub.getEndDate().isAfter(now)) {
                            newEndDate = activeSub.getEndDate().plus(sub.getPlan().getDurationDays(), ChronoUnit.DAYS);
                            trimQuotaAt = activeSub.getEndDate();
                        }
                        List<CompanySubFeatureUsage> oldUsages = companySubFeatureUsageRepository.findBySubscriptionId(activeSub.getId());
                        for (CompanySubFeatureUsage oldUsage : oldUsages) {
                            int remaining = oldUsage.getTotalQuota() - oldUsage.getTotalUsed();
                            if (remaining > 0) {
                                remainingQuotas.put(oldUsage.getFeature().getId(), remaining);
                            }
                        }
                    }
                    activeSub.setStatus(SubscriptionStatus.CANCELLED);
                    companySubscriptionRepository.save(activeSub);
                }
            }

            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setStartDate(now);
            sub.setEndDate(newEndDate);
            if (trimQuotaAt != null) {
                sub.setTrimQuotaAt(trimQuotaAt);
                sub.setIsQuotaTrimmed(false);
            }
            companySubscriptionRepository.save(sub);

            if (sub.getPlan().getPlanFeatures() != null) {
                for (CompanyPlanFeature pf : sub.getPlan().getPlanFeatures()) {
                    int extraQuota = remainingQuotas.getOrDefault(pf.getFeature().getId(), 0);
                    CompanySubFeatureUsage usage = CompanySubFeatureUsage.builder()
                            .subscription(sub)
                            .feature(pf.getFeature())
                            .totalQuota(pf.getTotalQuota() + extraQuota)
                            .totalUsed(0)
                            .build();
                    companySubFeatureUsageRepository.save(usage);

                    // Create rate usage rows (daily/weekly caps)
                    for (CompanyPlanFeatureRateLimit rl : pf.getRateLimits()) {
                        CompanySubFeatureRateUsage rateUsage = CompanySubFeatureRateUsage.builder()
                                .usage(usage)
                                .resetType(rl.getResetType())
                                .capQuota(rl.getCapQuota())
                                .used(0)
                                .lastResetDate(now)
                                .build();
                        companySubFeatureRateUsageRepository.save(rateUsage);
                    }
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
        // Guard: không tạo trùng nếu đã có active sub
        Instant now = Instant.now();
        boolean alreadyActive = !candidateSubscriptionRepository
                .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        userId, SubscriptionStatus.ACTIVE, now, now)
                .isEmpty();
        if (alreadyActive) return;

        // Tìm gói Free của Candidate (price = 0)
        CandidateSubscriptionPlan freePlan = candidateSubscriptionPlanRepository
                .findFirstByPriceAndIsActiveTrue(0L)
                .orElse(null);
        if (freePlan == null) return; // Không có gói Free → bỏ qua, không throw exception

        User user = userService.getUserEntityById(userId);
        CandidateSubscription sub = new CandidateSubscription();
        sub.setUser(user);
        sub.setPlan(freePlan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartDate(now);
        // Free plan: durationDays có thể là 0 hoặc rất lớn → dùng 36500 (100 năm) nếu là 0
        long duration = freePlan.getDurationDays() > 0 ? freePlan.getDurationDays() : 36500L;
        sub.setEndDate(now.plus(duration, ChronoUnit.DAYS));
        CandidateSubscription savedSub = candidateSubscriptionRepository.save(sub);

        // Tạo usage records cho từng feature của gói Free
        if (freePlan.getPlanFeatures() != null) {
            for (CandidatePlanFeature pf : freePlan.getPlanFeatures()) {
                CandidateSubFeatureUsage usage = CandidateSubFeatureUsage.builder()
                        .subscription(savedSub)
                        .feature(pf.getFeature())
                        .totalQuota(pf.getTotalQuota())
                        .totalUsed(0)
                        .build();
                CandidateSubFeatureUsage savedUsage = candidateSubFeatureUsageRepository.save(usage);

                for (CandidatePlanFeatureRateLimit rl : pf.getRateLimits()) {
                    CandidateSubFeatureRateUsage rateUsage = CandidateSubFeatureRateUsage.builder()
                            .usage(savedUsage)
                            .resetType(rl.getResetType())
                            .capQuota(rl.getCapQuota())
                            .used(0)
                            .lastResetDate(now)
                            .build();
                    candidateSubFeatureRateUsageRepository.save(rateUsage);
                }
            }
        }
    }
}
