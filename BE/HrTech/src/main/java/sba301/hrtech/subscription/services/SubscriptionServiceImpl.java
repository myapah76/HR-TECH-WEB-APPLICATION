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
import sba301.hrtech.subscription.entities.CandidateSubscription;
import sba301.hrtech.subscription.entities.CandidateSubscriptionPlan;
import sba301.hrtech.subscription.entities.CompanySubscription;
import sba301.hrtech.subscription.entities.CompanySubscriptionPlan;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.Instant;
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
    private final CandidateSubFeatureUsageRepository candidateSubFeatureUsageRepository;
    private final CompanySubFeatureUsageRepository companySubFeatureUsageRepository;
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
                        .stream().map(u -> new SubFeatureUsageResponse(u.getFeature().getCode(), u.getFeature().getName(), u.getQuota(), u.getUsed()))
                        .collect(Collectors.toList());
                return new MySubscriptionResponse(
                        sub.getId(),
                        sub.getPlan().getId(),
                        sub.getPlan().getName(),
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
                        .stream().map(u -> new SubFeatureUsageResponse(u.getFeature().getCode(), u.getFeature().getName(), u.getQuota(), u.getUsed()))
                        .collect(Collectors.toList());
                    return new MySubscriptionResponse(
                            sub.getId(),
                            sub.getPlan().getId(),
                            sub.getPlan().getName(),
                            sub.getStatus(),
                            sub.getStartDate(),
                            sub.getEndDate(),
                            usage);
                }
            }
        }
        return null;
    }
}
