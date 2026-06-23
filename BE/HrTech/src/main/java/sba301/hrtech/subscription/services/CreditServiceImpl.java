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
import sba301.hrtech.subscription.entities.CandidateSubscription;
import sba301.hrtech.subscription.entities.CompanySubscription;
import sba301.hrtech.subscription.entities.CandidateSubFeatureUsage;
import sba301.hrtech.subscription.entities.CompanySubFeatureUsage;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.LocalDate;
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
    private final ICompanyService companyService;

    @Override
    @Transactional
    public void deductCandidateQuota(UUID userId, String featureCode, int amount) {
        log.info("Deducting {} {} quota for candidate {}", amount, featureCode, userId);

        List<CandidateSubscription> activeSubscriptions = candidateSubscriptionRepository
                .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        userId, SubscriptionStatus.ACTIVE, LocalDate.now(), LocalDate.now());

        boolean success = false;
        for (CandidateSubscription sub : activeSubscriptions) {
            Optional<CandidateSubFeatureUsage> usageOpt = candidateSubFeatureUsageRepository
                    .findBySubscriptionIdAndFeatureCode(sub.getId(), featureCode);
            if (usageOpt.isPresent()) {
                CandidateSubFeatureUsage usage = usageOpt.get();
                if (usage.getQuota() - usage.getUsed() >= amount) {
                    usage.setUsed(usage.getUsed() + amount);
                    candidateSubFeatureUsageRepository.save(usage);
                    success = true;
                    log.info("Successfully deducted {} {}.", amount, featureCode);
                    break;
                }
            }
        }

        if (!success) {
            log.warn("Candidate {} does not have an active subscription with enough {} quota", userId, featureCode);
            throw new AppException(ErrorCode.INSUFFICIENT_QUOTA,
                    "You do not have enough quota for this feature. Please upgrade your subscription.");
        }
    }

    @Override
    @Transactional
    public void deductCompanyFeatureQuota(UUID userId, String featureCode, int amount) {
        log.info("Deducting {} {} quota for company member {}", amount, featureCode, userId);

        CompanyMember member = companyService.getMemberEntityByUserId(userId);
        UUID companyId = member.getCompany().getId();

        List<CompanySubscription> activeSubscriptions = companySubscriptionRepository
                .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        companyId, SubscriptionStatus.ACTIVE, LocalDate.now(), LocalDate.now());

        boolean success = false;
        for (CompanySubscription sub : activeSubscriptions) {
            Optional<CompanySubFeatureUsage> usageOpt = companySubFeatureUsageRepository
                    .findBySubscriptionIdAndFeatureCode(sub.getId(), featureCode);
            if (usageOpt.isPresent()) {
                CompanySubFeatureUsage usage = usageOpt.get();
                if (usage.getQuota() - usage.getUsed() >= amount) {
                    usage.setUsed(usage.getUsed() + amount);
                    companySubFeatureUsageRepository.save(usage);
                    success = true;
                    log.info("Successfully deducted {} {}.", amount, featureCode);
                    break;
                }
            }
        }

        if (!success) {
            log.warn("Company {} does not have an active subscription with enough {} quota", companyId, featureCode);
            throw new AppException(ErrorCode.INSUFFICIENT_QUOTA,
                    "Your company does not have enough quota for this feature. Please upgrade your subscription.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCandidateFeatureAccess(UUID userId, String featureCode) {
        List<CandidateSubscription> activeSubscriptions = candidateSubscriptionRepository
                .findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        userId, SubscriptionStatus.ACTIVE, LocalDate.now(), LocalDate.now());

        for (CandidateSubscription sub : activeSubscriptions) {
            Optional<CandidateSubFeatureUsage> usageOpt = candidateSubFeatureUsageRepository
                    .findBySubscriptionIdAndFeatureCode(sub.getId(), featureCode);
            if (usageOpt.isPresent() && usageOpt.get().getQuota() > 0) {
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCompanyFeatureAccess(UUID userId, String featureCode) {
        CompanyMember member = companyService.getMemberEntityByUserId(userId);
        UUID companyId = member.getCompany().getId();

        List<CompanySubscription> activeSubscriptions = companySubscriptionRepository
                .findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        companyId, SubscriptionStatus.ACTIVE, LocalDate.now(), LocalDate.now());

        for (CompanySubscription sub : activeSubscriptions) {
            Optional<CompanySubFeatureUsage> usageOpt = companySubFeatureUsageRepository
                    .findBySubscriptionIdAndFeatureCode(sub.getId(), featureCode);
            if (usageOpt.isPresent() && usageOpt.get().getQuota() > 0) {
                return true;
            }
        }
        return false;
    }
}
