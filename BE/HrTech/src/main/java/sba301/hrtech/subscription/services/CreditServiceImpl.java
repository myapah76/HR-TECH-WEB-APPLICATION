package sba301.hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.subscription.abstractions.services.ICreditService;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubscriptionRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubFeatureUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubFeatureUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubFeatureRateUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubFeatureRateUsageRepository;
import sba301.hrtech.subscription.entities.CandidateSubscription;
import sba301.hrtech.subscription.entities.CompanySubscription;
import sba301.hrtech.subscription.entities.CandidateSubFeatureUsage;
import sba301.hrtech.subscription.entities.CompanySubFeatureUsage;
import sba301.hrtech.subscription.entities.CandidateSubFeatureRateUsage;
import sba301.hrtech.subscription.entities.CompanySubFeatureRateUsage;
import sba301.hrtech.subscription.entities.enums.ResetType;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

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
    private final CandidateSubFeatureUsageRepository candidateSubFeatureUsageRepository;
    private final CompanySubFeatureUsageRepository companySubFeatureUsageRepository;
    private final CandidateSubFeatureRateUsageRepository candidateSubFeatureRateUsageRepository;
    private final CompanySubFeatureRateUsageRepository companySubFeatureRateUsageRepository;
    private final ICompanyService companyService;

    // ─── Candidate ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deductCandidateQuota(UUID userId, String featureCode, int amount) {
        log.info("Deducting {} {} quota for candidate {}", amount, featureCode, userId);

        List<CandidateSubscription> activeSubscriptions = candidateSubscriptionRepository
                .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        userId, SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());

        boolean success = false;
        for (CandidateSubscription sub : activeSubscriptions) {
            Optional<CandidateSubFeatureUsage> usageOpt = candidateSubFeatureUsageRepository
                    .findBySubscriptionIdAndFeatureCode(sub.getId(), featureCode);

            if (usageOpt.isEmpty()) continue;
            CandidateSubFeatureUsage usage = usageOpt.get();

            // Check total pool
            if (usage.getTotalQuota() - usage.getTotalUsed() < amount) continue;

            // Fetch & check rate usages
            List<CandidateSubFeatureRateUsage> rateUsages =
                    candidateSubFeatureRateUsageRepository.findByUsageId(usage.getId());

            boolean allRatesPassed = true;
            for (CandidateSubFeatureRateUsage ru : rateUsages) {
                resetCandidateRateUsageIfNeeded(ru, sub);
                if (ru.getCapQuota() - ru.getUsed() < amount) {
                    allRatesPassed = false;
                    break;
                }
            }
            if (!allRatesPassed) continue;

            // All checks passed — deduct
            usage.setTotalUsed(usage.getTotalUsed() + amount);
            candidateSubFeatureUsageRepository.save(usage);

            for (CandidateSubFeatureRateUsage ru : rateUsages) {
                ru.setUsed(ru.getUsed() + amount);
                candidateSubFeatureRateUsageRepository.save(ru);
            }

            success = true;
            log.info("Successfully deducted {} {} for candidate {}.", amount, featureCode, userId);
            break;
        }

        if (!success) {
            log.warn("Candidate {} does not have enough {} quota (total or rate limited)", userId, featureCode);
            throw new AppException(ErrorCode.INSUFFICIENT_QUOTA,
                    "You do not have enough quota for this feature. Please upgrade your subscription.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCandidateFeatureAccess(UUID userId, String featureCode) {
        List<CandidateSubscription> activeSubscriptions = candidateSubscriptionRepository
                .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        userId, SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());

        for (CandidateSubscription sub : activeSubscriptions) {
            Optional<CandidateSubFeatureUsage> usageOpt = candidateSubFeatureUsageRepository
                    .findBySubscriptionIdAndFeatureCode(sub.getId(), featureCode);
            if (usageOpt.isPresent() && usageOpt.get().getTotalQuota() > 0) {
                return true;
            }
        }
        return false;
    }

    // ─── Company ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deductCompanyFeatureQuota(UUID userId, String featureCode, int amount) {
        log.info("Deducting {} {} quota for company member {}", amount, featureCode, userId);

        CompanyMember member = companyService.getMemberEntityByUserId(userId);
        UUID companyId = member.getCompany().getId();

        List<CompanySubscription> activeSubscriptions = companySubscriptionRepository
                .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        companyId, SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());

        boolean success = false;
        for (CompanySubscription sub : activeSubscriptions) {
            Optional<CompanySubFeatureUsage> usageOpt = companySubFeatureUsageRepository
                    .findBySubscriptionIdAndFeatureCode(sub.getId(), featureCode);

            if (usageOpt.isEmpty()) continue;
            CompanySubFeatureUsage usage = usageOpt.get();

            // Check total pool
            if (usage.getTotalQuota() - usage.getTotalUsed() < amount) continue;

            // Fetch & check rate usages
            List<CompanySubFeatureRateUsage> rateUsages =
                    companySubFeatureRateUsageRepository.findByUsageId(usage.getId());

            boolean allRatesPassed = true;
            for (CompanySubFeatureRateUsage ru : rateUsages) {
                resetCompanyRateUsageIfNeeded(ru, sub);
                if (ru.getCapQuota() - ru.getUsed() < amount) {
                    allRatesPassed = false;
                    break;
                }
            }
            if (!allRatesPassed) continue;

            // All checks passed — deduct
            usage.setTotalUsed(usage.getTotalUsed() + amount);
            companySubFeatureUsageRepository.save(usage);

            for (CompanySubFeatureRateUsage ru : rateUsages) {
                ru.setUsed(ru.getUsed() + amount);
                companySubFeatureRateUsageRepository.save(ru);
            }

            success = true;
            log.info("Successfully deducted {} {} for company {}.", amount, featureCode, companyId);
            break;
        }

        if (!success) {
            log.warn("Company {} does not have enough {} quota (total or rate limited)", companyId, featureCode);
            throw new AppException(ErrorCode.INSUFFICIENT_QUOTA,
                    "Your company does not have enough quota for this feature. Please upgrade your subscription.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCompanyFeatureAccess(UUID userId, String featureCode) {
        CompanyMember member = companyService.getMemberEntityByUserId(userId);
        UUID companyId = member.getCompany().getId();

        List<CompanySubscription> activeSubscriptions = companySubscriptionRepository
                .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        companyId, SubscriptionStatus.ACTIVE, Instant.now(), Instant.now());

        for (CompanySubscription sub : activeSubscriptions) {
            Optional<CompanySubFeatureUsage> usageOpt = companySubFeatureUsageRepository
                    .findBySubscriptionIdAndFeatureCode(sub.getId(), featureCode);
            if (usageOpt.isPresent() && usageOpt.get().getTotalQuota() > 0) {
                return true;
            }
        }
        return false;
    }

    // ─── Private Reset Helpers ─────────────────────────────────────────────────

    private void resetCandidateRateUsageIfNeeded(CandidateSubFeatureRateUsage ru, CandidateSubscription sub) {
        Instant now = Instant.now();
        Instant lastReset = ru.getLastResetDate();
        boolean shouldReset = false;

        if (lastReset == null) {
            shouldReset = true;
        } else if (ru.getResetType() == ResetType.DAILY) {
            shouldReset = now.truncatedTo(ChronoUnit.DAYS).isAfter(lastReset.truncatedTo(ChronoUnit.DAYS));
        } else if (ru.getResetType() == ResetType.WEEKLY) {
            long currentWeek = ChronoUnit.DAYS.between(
                    sub.getStartDate().truncatedTo(ChronoUnit.DAYS),
                    now.truncatedTo(ChronoUnit.DAYS)) / 7;
            long lastResetWeek = ChronoUnit.DAYS.between(
                    sub.getStartDate().truncatedTo(ChronoUnit.DAYS),
                    lastReset.truncatedTo(ChronoUnit.DAYS)) / 7;
            shouldReset = currentWeek > lastResetWeek;
        }

        if (shouldReset) {
            ru.setUsed(0);
            ru.setLastResetDate(now);
        }
    }

    private void resetCompanyRateUsageIfNeeded(CompanySubFeatureRateUsage ru, CompanySubscription sub) {
        Instant now = Instant.now();
        Instant lastReset = ru.getLastResetDate();
        boolean shouldReset = false;

        if (lastReset == null) {
            shouldReset = true;
        } else if (ru.getResetType() == ResetType.DAILY) {
            shouldReset = now.truncatedTo(ChronoUnit.DAYS).isAfter(lastReset.truncatedTo(ChronoUnit.DAYS));
        } else if (ru.getResetType() == ResetType.WEEKLY) {
            long currentWeek = ChronoUnit.DAYS.between(
                    sub.getStartDate().truncatedTo(ChronoUnit.DAYS),
                    now.truncatedTo(ChronoUnit.DAYS)) / 7;
            long lastResetWeek = ChronoUnit.DAYS.between(
                    sub.getStartDate().truncatedTo(ChronoUnit.DAYS),
                    lastReset.truncatedTo(ChronoUnit.DAYS)) / 7;
            shouldReset = currentWeek > lastResetWeek;
        }

        if (shouldReset) {
            ru.setUsed(0);
            ru.setLastResetDate(now);
        }
    }
}
