package hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.company.entities.CompanyMember;
import hrtech.subscription.abstractions.services.ICreditService;
import hrtech.subscription.abstractions.repositories.CandidateSubscriptionRepository;
import hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;
import hrtech.subscription.entities.CandidateSubscription;
import hrtech.subscription.entities.CompanySubscription;
import hrtech.subscription.entities.enums.ResetType;
import hrtech.subscription.entities.enums.SubscriptionStatus;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.company.entities.Company;
import hrtech.identity.entities.User;
import hrtech.subscription.entities.CandidatePlanFeature;
import hrtech.subscription.entities.CompanyPlanFeature;
import hrtech.subscription.entities.CandidateSubscriptionPlan;
import hrtech.subscription.entities.CompanySubscriptionPlan;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditServiceImpl implements ICreditService {

    private final CandidateSubscriptionRepository candidateSubscriptionRepository;
    private final CompanySubscriptionRepository companySubscriptionRepository;
    private final IUserService userService;
    private final ICompanyService companyService;

    // ─── Candidate ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deductCandidateQuota(UUID userId, String featureCode, int amount) {
        log.info("Deducting {} {} quota for candidate {}", amount, featureCode, userId);
        User user = userService.getUserEntityById(userId);

        if ("AI_CREDIT".equals(featureCode)) {
            if (user.getAiCreditBalance() < amount) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "You do not have enough AI Credits.");
            }
            user.setAiCreditBalance(user.getAiCreditBalance() - amount);
            userService.saveUserEntity(user);
            return;
        }

        // For non-token features that consume AI_CREDIT
        List<CandidateSubscription> activeSubs = candidateSubscriptionRepository
                .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        userId, SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());
        
        if (activeSubs.isEmpty()) {
            throw new AppException(ErrorCode.FORBIDDEN, "No active subscription.");
        }
        
        CandidateSubscription sub = activeSubs.getFirst();
        CandidatePlanFeature targetPf = null;
        for (CandidatePlanFeature pf : sub.getPlan().getPlanFeatures()) {
            if (pf.getFeature().getCode().equals(featureCode)) {
                targetPf = pf;
                break;
            }
        }
        
        if (targetPf == null) {
            throw new AppException(ErrorCode.FORBIDDEN, "Feature not included in your active plan.");
        }

        // Deduct AI Credit if this feature has an AI credit cost
        if (targetPf.getAiCreditCost() != null && targetPf.getAiCreditCost() > 0) {
            int cost = targetPf.getAiCreditCost();
            checkAndUpdateCandidateSubscriptionRateLimits(sub, cost, user);
            
            if (user.getAiCreditBalance() < cost) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "You do not have enough AI Credits. Required: " + cost);
            }
            user.setAiCreditBalance(user.getAiCreditBalance() - cost);
            userService.saveUserEntity(user);
        }
    }

    private void checkAndUpdateCandidateSubscriptionRateLimits(CandidateSubscription sub, int cost, User user) {
        Instant now = Instant.now();
        if (sub.getLastDailyReset() == null || isResetNeeded(sub.getLastDailyReset(), ResetType.DAILY, sub.getStartDate())) {
            sub.setDailyAiUsage(0);
            sub.setLastDailyReset(now);
        }
        if (sub.getLastWeeklyReset() == null || isResetNeeded(sub.getLastWeeklyReset(), ResetType.WEEKLY, sub.getStartDate())) {
            sub.setWeeklyAiUsage(0);
            sub.setLastWeeklyReset(now);
        }
        
        CandidateSubscriptionPlan plan = sub.getPlan();
        if (plan.getDailyAiLimit() != null && plan.getDailyAiLimit() > 0) {
            if (sub.getDailyAiUsage() + cost > plan.getDailyAiLimit()) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA,
                        "Hạn mức sử dụng AI hàng ngày đã hết. (Đã dùng: " + sub.getDailyAiUsage() + "/" + plan.getDailyAiLimit() + " AI Credits)");
            }
        }
        if (plan.getWeeklyAiLimit() != null && plan.getWeeklyAiLimit() > 0) {
            if (sub.getWeeklyAiUsage() + cost > plan.getWeeklyAiLimit()) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA,
                        "Hạn mức sử dụng AI hàng tuần đã hết. (Đã dùng: " + sub.getWeeklyAiUsage() + "/" + plan.getWeeklyAiLimit() + " AI Credits)");
            }
        }
        
        sub.setDailyAiUsage(sub.getDailyAiUsage() + cost);
        sub.setWeeklyAiUsage(sub.getWeeklyAiUsage() + cost);
        candidateSubscriptionRepository.save(sub);
    }

    private boolean checkCandidateSubscriptionRateLimits(CandidateSubscription sub, int cost) {
        int currentDailyUsage = sub.getDailyAiUsage() != null ? sub.getDailyAiUsage() : 0;
        int currentWeeklyUsage = sub.getWeeklyAiUsage() != null ? sub.getWeeklyAiUsage() : 0;
        
        if (sub.getLastDailyReset() == null || isResetNeeded(sub.getLastDailyReset(), ResetType.DAILY, sub.getStartDate())) {
            currentDailyUsage = 0;
        }
        if (sub.getLastWeeklyReset() == null || isResetNeeded(sub.getLastWeeklyReset(), ResetType.WEEKLY, sub.getStartDate())) {
            currentWeeklyUsage = 0;
        }
        
        CandidateSubscriptionPlan plan = sub.getPlan();
        if (plan.getDailyAiLimit() != null && plan.getDailyAiLimit() > 0) {
            if (currentDailyUsage + cost > plan.getDailyAiLimit()) {
                return false;
            }
        }
        if (plan.getWeeklyAiLimit() != null && plan.getWeeklyAiLimit() > 0) {
            if (currentWeeklyUsage + cost > plan.getWeeklyAiLimit()) {
                return false;
            }
        }
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCandidateFeatureAccess(UUID userId, String featureCode) {
        User user = userService.getUserEntityById(userId);

        if ("AI_CREDIT".equals(featureCode)) {
            return user.getAiCreditBalance() > 0;
        }

        List<CandidateSubscription> activeSubs = candidateSubscriptionRepository
                .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        userId, SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());
        
        if (activeSubs.isEmpty()) return false;
        
        CandidateSubscription sub = activeSubs.getFirst();
        CandidatePlanFeature targetPf = null;
        for (CandidatePlanFeature pf : sub.getPlan().getPlanFeatures()) {
            if (pf.getFeature().getCode().equals(featureCode)) {
                targetPf = pf;
                break;
            }
        }
        
        if (targetPf == null) return false;

        // If feature has an AI credit cost, check if user has enough credits
        if (targetPf.getAiCreditCost() != null && targetPf.getAiCreditCost() > 0) {
            int cost = targetPf.getAiCreditCost();
            if (user.getAiCreditBalance() < cost) {
                return false;
            }
            if (!checkCandidateSubscriptionRateLimits(sub, cost)) {
                return false;
            }
        }
        
        return true;
    }

    // ─── Company ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deductCompanyFeatureQuota(UUID userId, String featureCode, int amount) {
        log.info("Deducting {} {} quota for company member {}", amount, featureCode, userId);
        CompanyMember member = companyService.getMemberEntityByUserId(userId);
        Company company = member.getCompany();

        if ("AI_CREDIT".equals(featureCode)) {
            if (company.getAiCreditBalance() < amount) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "Not enough AI Credits.");
            }
            companyService.updateCompanyBalances(company.getId(), -amount, 0);
            return;
        } else if ("JOB_POSTING".equals(featureCode)) {
            if (company.getJobPostBalance() < amount) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "Not enough Job Post balance.");
            }
            companyService.updateCompanyBalances(company.getId(), 0, -amount);
            return;
        }

        List<CompanySubscription> activeSubs = companySubscriptionRepository
                .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        company.getId(), SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());
        
        if (activeSubs.isEmpty()) {
            throw new AppException(ErrorCode.FORBIDDEN, "No active subscription.");
        }
        
        CompanySubscription sub = activeSubs.getFirst();
        CompanyPlanFeature targetPf = null;
        for (CompanyPlanFeature pf : sub.getPlan().getPlanFeatures()) {
            if (pf.getFeature().getCode().equals(featureCode)) {
                targetPf = pf;
                break;
            }
        }
        
        if (targetPf == null) {
            throw new AppException(ErrorCode.FORBIDDEN, "Feature not included in plan.");
        }

        // Deduct AI Credit if this feature has an AI credit cost
        if (targetPf.getAiCreditCost() != null && targetPf.getAiCreditCost() > 0) {
            int cost = targetPf.getAiCreditCost();
            checkAndUpdateCompanySubscriptionRateLimits(sub, cost, company);
            
            if (company.getAiCreditBalance() < cost) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "Not enough AI Credits. Required: " + cost);
            }
            companyService.updateCompanyBalances(company.getId(), -cost, 0);
        }
    }

    private void checkAndUpdateCompanySubscriptionRateLimits(CompanySubscription sub, int cost, Company company) {
        Instant now = Instant.now();
        if (sub.getLastDailyReset() == null || isResetNeeded(sub.getLastDailyReset(), ResetType.DAILY, sub.getStartDate())) {
            sub.setDailyAiUsage(0);
            sub.setLastDailyReset(now);
        }
        if (sub.getLastWeeklyReset() == null || isResetNeeded(sub.getLastWeeklyReset(), ResetType.WEEKLY, sub.getStartDate())) {
            sub.setWeeklyAiUsage(0);
            sub.setLastWeeklyReset(now);
        }
        
        CompanySubscriptionPlan plan = sub.getPlan();
        if (plan.getDailyAiLimit() != null && plan.getDailyAiLimit() > 0) {
            if (sub.getDailyAiUsage() + cost > plan.getDailyAiLimit()) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA,
                        "Hạn mức sử dụng AI hàng ngày của gói đã hết. (Đã dùng: " + sub.getDailyAiUsage() + "/" + plan.getDailyAiLimit() + " AI Credits)");
            }
        }
        if (plan.getWeeklyAiLimit() != null && plan.getWeeklyAiLimit() > 0) {
            if (sub.getWeeklyAiUsage() + cost > plan.getWeeklyAiLimit()) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA,
                        "Hạn mức sử dụng AI hàng tuần của gói đã hết. (Đã dùng: " + sub.getWeeklyAiUsage() + "/" + plan.getWeeklyAiLimit() + " AI Credits)");
            }
        }
        
        sub.setDailyAiUsage(sub.getDailyAiUsage() + cost);
        sub.setWeeklyAiUsage(sub.getWeeklyAiUsage() + cost);
        companySubscriptionRepository.save(sub);
    }

    private boolean checkCompanySubscriptionRateLimits(CompanySubscription sub, int cost) {
        int currentDailyUsage = sub.getDailyAiUsage() != null ? sub.getDailyAiUsage() : 0;
        int currentWeeklyUsage = sub.getWeeklyAiUsage() != null ? sub.getWeeklyAiUsage() : 0;
        
        if (sub.getLastDailyReset() == null || isResetNeeded(sub.getLastDailyReset(), ResetType.DAILY, sub.getStartDate())) {
            currentDailyUsage = 0;
        }
        if (sub.getLastWeeklyReset() == null || isResetNeeded(sub.getLastWeeklyReset(), ResetType.WEEKLY, sub.getStartDate())) {
            currentWeeklyUsage = 0;
        }
        
        CompanySubscriptionPlan plan = sub.getPlan();
        if (plan.getDailyAiLimit() != null && plan.getDailyAiLimit() > 0) {
            if (currentDailyUsage + cost > plan.getDailyAiLimit()) {
                return false;
            }
        }
        if (plan.getWeeklyAiLimit() != null && plan.getWeeklyAiLimit() > 0) {
            if (currentWeeklyUsage + cost > plan.getWeeklyAiLimit()) {
                return false;
            }
        }
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCompanyFeatureAccess(UUID companyId, String featureCode) {
        Company company = companyService.getCompanyEntityById(companyId);

        if ("AI_CREDIT".equals(featureCode)) {
            return company.getAiCreditBalance() > 0;
        } else if ("JOB_POSTING".equals(featureCode)) {
            return company.getJobPostBalance() > 0;
        }

        List<CompanySubscription> activeSubs = companySubscriptionRepository
                .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        companyId, SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());
        
        if (activeSubs.isEmpty()) return false;
        
        CompanySubscription sub = activeSubs.getFirst();
        CompanyPlanFeature targetPf = null;
        for (CompanyPlanFeature pf : sub.getPlan().getPlanFeatures()) {
            if (pf.getFeature().getCode().equals(featureCode)) {
                targetPf = pf;
                break;
            }
        }
        
        if (targetPf == null) return false;

        // If feature has an AI credit cost, check if company has enough credits
        if (targetPf.getAiCreditCost() != null && targetPf.getAiCreditCost() > 0) {
            int cost = targetPf.getAiCreditCost();
            if (company.getAiCreditBalance() < cost) {
                return false;
            }
            if (!checkCompanySubscriptionRateLimits(sub, cost)) {
                return false;
            }
        }
        
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCompanyFeatureAccessByUserId(UUID userId, String featureCode) {
        try {
            CompanyMember member = companyService.getMemberEntityByUserId(userId);
            if (member == null || member.getCompany() == null) return false;
            return hasCompanyFeatureAccess(member.getCompany().getId(), featureCode);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isResetNeeded(Instant lastResetDate, ResetType resetType, Instant subStartDate) {
        Instant now = Instant.now();

        // 1. Nếu startDate của Subscription mới diễn ra SAU lastResetDate
        if (subStartDate.isAfter(lastResetDate)) {
            return true;
        }

        return switch (resetType) {
            case DAILY -> ChronoUnit.DAYS.between(lastResetDate, now) >= 1;
            case WEEKLY -> ChronoUnit.DAYS.between(lastResetDate, now) >= 7;
        };
    }
}
