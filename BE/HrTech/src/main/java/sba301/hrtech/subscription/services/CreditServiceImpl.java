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
    public void deductAiCredit(UUID userId, int amount) {
        log.info("Deducting {} AI Credits for candidate {}", amount, userId);
        
        List<CandidateSubscription> activeSubscriptions = candidateSubscriptionRepository.findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                userId, SubscriptionStatus.ACTIVE, LocalDate.now(), LocalDate.now());

        boolean success = false;
        for (CandidateSubscription sub : activeSubscriptions) {
            Optional<CandidateSubFeatureUsage> usageOpt = candidateSubFeatureUsageRepository.findBySubscriptionIdAndFeatureCode(sub.getId(), "AI_MATCHING");
            if (usageOpt.isPresent()) {
                CandidateSubFeatureUsage usage = usageOpt.get();
                if (usage.getQuota() - usage.getUsed() >= amount) {
                    usage.setUsed(usage.getUsed() + amount);
                    candidateSubFeatureUsageRepository.save(usage);
                    success = true;
                    log.info("Successfully deducted {} AI Credits.", amount);
                    break;
                }
            }
        }

        if (!success) {
            log.warn("Candidate {} does not have an active subscription with enough AI Credits", userId);
            throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "You do not have enough AI Credits. Please upgrade your subscription.");
        }
    }

    @Override
    @Transactional
    public void deductJobQuota(UUID userId, int amount) {
        log.info("Deducting {} Job Quota for company member {}", amount, userId);

        CompanyMember member = companyService.getMemberEntityByUserId(userId);

        UUID companyId = member.getCompany().getId();

        List<CompanySubscription> activeSubscriptions = companySubscriptionRepository.findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                companyId, SubscriptionStatus.ACTIVE, LocalDate.now(), LocalDate.now());

        boolean success = false;
        for (CompanySubscription sub : activeSubscriptions) {
            Optional<CompanySubFeatureUsage> usageOpt = companySubFeatureUsageRepository.findBySubscriptionIdAndFeatureCode(sub.getId(), "JOB_POST");
            if (usageOpt.isPresent()) {
                CompanySubFeatureUsage usage = usageOpt.get();
                if (usage.getQuota() - usage.getUsed() >= amount) {
                    usage.setUsed(usage.getUsed() + amount);
                    companySubFeatureUsageRepository.save(usage);
                    success = true;
                    log.info("Successfully deducted {} Job Quota.", amount);
                    break;
                }
            }
        }

        if (!success) {
            log.warn("Company {} does not have an active subscription with enough Job Quota", companyId);
            throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "Your company does not have enough Job Post Quota. Please upgrade your subscription.");
        }
    }
}
