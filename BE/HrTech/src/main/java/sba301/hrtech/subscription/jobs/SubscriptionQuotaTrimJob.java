package sba301.hrtech.subscription.jobs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubFeatureUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CandidateSubscriptionRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubFeatureUsageRepository;
import sba301.hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;
import sba301.hrtech.subscription.entities.*;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionQuotaTrimJob {

    private final CandidateSubscriptionRepository candidateSubscriptionRepository;
    private final CompanySubscriptionRepository companySubscriptionRepository;
    private final CandidateSubFeatureUsageRepository candidateSubFeatureUsageRepository;
    private final CompanySubFeatureUsageRepository companySubFeatureUsageRepository;

    /**
     * Chạy mỗi giờ một lần để kiểm tra các subscription nào cần bị trim quota (do quá hạn của gói cũ khi cộng dồn).
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void trimExpiredQuotas() {
        log.info("Started SubscriptionQuotaTrimJob to trim expired bonus quotas...");
        Instant now = Instant.now();

        // 1. Candidate Subscriptions
        List<CandidateSubscription> candidateSubs = candidateSubscriptionRepository
                .findByStatusAndTrimQuotaAtLessThanEqualAndIsQuotaTrimmedFalse(SubscriptionStatus.ACTIVE, now);

        for (CandidateSubscription sub : candidateSubs) {
            List<CandidateSubFeatureUsage> usages = candidateSubFeatureUsageRepository.findBySubscriptionId(sub.getId());
            for (CandidateSubFeatureUsage usage : usages) {
                // Determine default quota from the plan
                int defaultQuota = 0;
                if (sub.getPlan().getPlanFeatures() != null) {
                    for (CandidatePlanFeature pf : sub.getPlan().getPlanFeatures()) {
                        if (pf.getFeature().getId().equals(usage.getFeature().getId())) {
                            defaultQuota = pf.getTotalQuota();
                            break;
                        }
                    }
                }

                int remaining = usage.getTotalQuota() - usage.getTotalUsed();
                if (remaining > defaultQuota) {
                    // Trim quota down so that remaining equals defaultQuota
                    usage.setTotalQuota(defaultQuota + usage.getTotalUsed());
                    candidateSubFeatureUsageRepository.save(usage);
                }
            }
            sub.setIsQuotaTrimmed(true);
            candidateSubscriptionRepository.save(sub);
            log.info("Trimmed quota for candidate subscription: {}", sub.getId());
        }

        // 2. Company Subscriptions
        List<CompanySubscription> companySubs = companySubscriptionRepository
                .findByStatusAndTrimQuotaAtLessThanEqualAndIsQuotaTrimmedFalse(SubscriptionStatus.ACTIVE, now);

        for (CompanySubscription sub : companySubs) {
            List<CompanySubFeatureUsage> usages = companySubFeatureUsageRepository.findBySubscriptionId(sub.getId());
            for (CompanySubFeatureUsage usage : usages) {
                // Determine default quota from the plan
                int defaultQuota = 0;
                if (sub.getPlan().getPlanFeatures() != null) {
                    for (CompanyPlanFeature pf : sub.getPlan().getPlanFeatures()) {
                        if (pf.getFeature().getId().equals(usage.getFeature().getId())) {
                            defaultQuota = pf.getTotalQuota();
                            break;
                        }
                    }
                }

                int remaining = usage.getTotalQuota() - usage.getTotalUsed();
                if (remaining > defaultQuota) {
                    // Trim quota down so that remaining equals defaultQuota
                    usage.setTotalQuota(defaultQuota + usage.getTotalUsed());
                    companySubFeatureUsageRepository.save(usage);
                }
            }
            sub.setIsQuotaTrimmed(true);
            companySubscriptionRepository.save(sub);
            log.info("Trimmed quota for company subscription: {}", sub.getId());
        }

        log.info("Completed SubscriptionQuotaTrimJob.");
    }
}
