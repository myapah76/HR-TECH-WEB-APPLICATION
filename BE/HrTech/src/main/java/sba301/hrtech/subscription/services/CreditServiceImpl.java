package sba301.hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.subscription.abstractions.services.ICreditService;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubscriptionRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;
import sba301.hrtech.subscription.entities.CandidateSubscription;
import sba301.hrtech.subscription.entities.CompanySubscription;
import sba301.hrtech.subscription.entities.enums.ResetType;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;
import sba301.hrtech.subscription.abstractions.repositories.CandidateFeatureRateUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanyFeatureRateUsageRepository;
import sba301.hrtech.subscription.entities.CandidateFeatureRateUsage;
import sba301.hrtech.subscription.entities.CompanyFeatureRateUsage;
import sba301.hrtech.identity.abstractions.services.IUserService;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.subscription.entities.CandidatePlanFeature;
import sba301.hrtech.subscription.entities.CompanyPlanFeature;
import sba301.hrtech.subscription.entities.CandidatePlanFeatureRateLimit;
import sba301.hrtech.subscription.entities.CompanyPlanFeatureRateLimit;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditServiceImpl implements ICreditService {

    private final CandidateSubscriptionRepository candidateSubscriptionRepository;
    private final CompanySubscriptionRepository companySubscriptionRepository;
    private final CandidateFeatureRateUsageRepository CandidateFeatureRateUsageRepository;
    private final CompanyFeatureRateUsageRepository companyFeatureRateUsageRepository;
    private final IUserService userService;
    private final ICompanyService companyService;
    private final CompanyRepository companyRepository;

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

        final CandidatePlanFeature finalTargetPf = targetPf;
        for (CandidatePlanFeatureRateLimit rl : finalTargetPf.getRateLimits()) {
            Optional<CandidateFeatureRateUsage> rateUsageOpt = CandidateFeatureRateUsageRepository
                    .findByUserIdAndFeatureCodeAndResetType(userId, featureCode, rl.getResetType());
            
            CandidateFeatureRateUsage rateUsage = rateUsageOpt.orElseGet(() -> 
                CandidateFeatureRateUsage.builder()
                        .user(user)
                        .feature(finalTargetPf.getFeature())
                        .resetType(rl.getResetType())
                        .used(0)
                        .lastResetDate(Instant.now())
                        .build()
            );

            if (isResetNeeded(rateUsage.getLastResetDate(), rateUsage.getResetType(), sub.getStartDate())) {
                rateUsage.setUsed(0);
                rateUsage.setLastResetDate(Instant.now());
            }

            if (rateUsage.getUsed() + amount > rl.getCapQuota()) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "Rate limit exceeded for " + rl.getResetType());
            }

            rateUsage.setUsed(rateUsage.getUsed() + amount);
            CandidateFeatureRateUsageRepository.save(rateUsage);
        }
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
        
        for (CandidatePlanFeatureRateLimit rl : targetPf.getRateLimits()) {
            Optional<CandidateFeatureRateUsage> rateUsageOpt = CandidateFeatureRateUsageRepository
                    .findByUserIdAndFeatureCodeAndResetType(userId, featureCode, rl.getResetType());
            if (rateUsageOpt.isPresent()) {
                CandidateFeatureRateUsage rateUsage = rateUsageOpt.get();
                if (isResetNeeded(rateUsage.getLastResetDate(), rateUsage.getResetType(), sub.getStartDate())) {
                    continue; 
                }
                if (rateUsage.getUsed() >= rl.getCapQuota()) {
                    return false;
                }
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
            company.setAiCreditBalance(company.getAiCreditBalance() - amount);
            companyRepository.save(company);
            return;
        } else if ("JOB_POSTING".equals(featureCode)) {
            if (company.getJobPostBalance() < amount) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "Not enough Job Post balance.");
            }
            company.setJobPostBalance(company.getJobPostBalance() - amount);
            companyRepository.save(company);
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

        final CompanyPlanFeature finalTargetPf = targetPf;
        for (CompanyPlanFeatureRateLimit rl : finalTargetPf.getRateLimits()) {
            Optional<CompanyFeatureRateUsage> rateUsageOpt = companyFeatureRateUsageRepository
                    .findByCompanyIdAndFeatureCodeAndResetType(company.getId(), featureCode, rl.getResetType());
            
            CompanyFeatureRateUsage rateUsage = rateUsageOpt.orElseGet(() -> 
                CompanyFeatureRateUsage.builder()
                        .company(company)
                        .feature(finalTargetPf.getFeature())
                        .resetType(rl.getResetType())
                        .used(0)
                        .lastResetDate(Instant.now())
                        .build()
            );

            if (isResetNeeded(rateUsage.getLastResetDate(), rateUsage.getResetType(), sub.getStartDate())) {
                rateUsage.setUsed(0);
                rateUsage.setLastResetDate(Instant.now());
            }

            if (rateUsage.getUsed() + amount > rl.getCapQuota()) {
                throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "Rate limit exceeded for " + rl.getResetType());
            }

            rateUsage.setUsed(rateUsage.getUsed() + amount);
            companyFeatureRateUsageRepository.save(rateUsage);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCompanyFeatureAccess(UUID companyId, String featureCode) {
        Company company = companyRepository.findById(companyId).orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Company not found"));

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
        
        for (CompanyPlanFeatureRateLimit rl : targetPf.getRateLimits()) {
            Optional<CompanyFeatureRateUsage> rateUsageOpt = companyFeatureRateUsageRepository
                    .findByCompanyIdAndFeatureCodeAndResetType(companyId, featureCode, rl.getResetType());
            if (rateUsageOpt.isPresent()) {
                CompanyFeatureRateUsage rateUsage = rateUsageOpt.get();
                if (isResetNeeded(rateUsage.getLastResetDate(), rateUsage.getResetType(), sub.getStartDate())) {
                    continue;
                }
                if (rateUsage.getUsed() >= rl.getCapQuota()) {
                    return false;
                }
            }
        }
        
        return true;
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
