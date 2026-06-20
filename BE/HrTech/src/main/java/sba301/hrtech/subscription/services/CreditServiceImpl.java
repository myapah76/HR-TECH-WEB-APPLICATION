package sba301.hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.subscription.abstractions.services.ICreditService;
import sba301.hrtech.subscription.abstractions.repositories.SubscriptionRepository;
import sba301.hrtech.subscription.entities.Subscription;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditServiceImpl implements ICreditService {

    private final SubscriptionRepository subscriptionRepository;

    @Override
    @Transactional
    public void deductAiCredit(UUID userId, int amount) {
        log.info("Deducting {} AI Credits for user {}", amount, userId);
        
        List<Subscription> activeSubscriptions = subscriptionRepository.findActiveSubscriptionsByUser(
                userId, SubscriptionStatus.ACTIVE, LocalDate.now());

        Optional<Subscription> validSub = activeSubscriptions.stream()
                .filter(sub -> sub.getRemainingAiCredits() >= amount)
                .findFirst();

        if (validSub.isEmpty()) {
            log.warn("User {} does not have an active subscription with enough AI Credits", userId);
            throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "You do not have enough AI Credits. Please upgrade your subscription.");
        }

        Subscription subscription = validSub.get();
        subscription.setRemainingAiCredits(subscription.getRemainingAiCredits() - amount);
        subscriptionRepository.save(subscription);
        log.info("Successfully deducted {} AI Credits. Remaining: {}", amount, subscription.getRemainingAiCredits());
    }

    @Override
    @Transactional
    public void deductJobQuota(UUID userId, int amount) {
        log.info("Deducting {} Job Quota for user {}", amount, userId);

        List<Subscription> activeSubscriptions = subscriptionRepository.findActiveSubscriptionsByUser(
                userId, SubscriptionStatus.ACTIVE, LocalDate.now());

        Optional<Subscription> validSub = activeSubscriptions.stream()
                .filter(sub -> sub.getRemainingJobPosts() >= amount)
                .findFirst();

        if (validSub.isEmpty()) {
            log.warn("User {} does not have an active subscription with enough Job Quota", userId);
            throw new AppException(ErrorCode.INSUFFICIENT_QUOTA, "You do not have enough Job Post Quota. Please upgrade your subscription.");
        }

        Subscription subscription = validSub.get();
        subscription.setRemainingJobPosts(subscription.getRemainingJobPosts() - amount);
        subscriptionRepository.save(subscription);
        log.info("Successfully deducted {} Job Quota. Remaining: {}", amount, subscription.getRemainingJobPosts());
    }
}
