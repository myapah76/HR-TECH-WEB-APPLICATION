package sba301.hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sba301.hrtech.identity.abstractions.services.IUserService;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.subscription.abstractions.repositories.SubscriptionRepository;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionService;
import sba301.hrtech.subscription.entities.Subscription;
import sba301.hrtech.subscription.entities.SubscriptionPlan;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements ISubscriptionService {

    private final IUserService userService;
    private final ISubscriptionPlanService subscriptionPlanService;

    private final SubscriptionRepository subscriptionRepository;

    @Override
    public Subscription createPendingSubscription(UUID userId, UUID planId) {
        User user = userService.getUserEntityById(userId);
        SubscriptionPlan plan = subscriptionPlanService.getById(planId);

            Subscription subscription = new  Subscription();
            subscription.setUser(user);
            subscription.setPlan(plan);
            subscription.setStatus(SubscriptionStatus.PENDING);
            subscription.setPlanType(plan.getPlanType());
            subscriptionRepository.save(subscription);
        return subscription;
    }
}
