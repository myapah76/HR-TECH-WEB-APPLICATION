package sba301.hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.subscription.abstractions.repositories.FeatureRepository;
import sba301.hrtech.subscription.abstractions.repositories.PlanFeatureRepository;
import sba301.hrtech.subscription.abstractions.repositories.SubscriptionPlanRepository;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import sba301.hrtech.subscription.dtos.subscriptionPlan.request.PlanFeatureRequest;
import sba301.hrtech.subscription.dtos.subscriptionPlan.request.SubscriptionPlanRequest;
import sba301.hrtech.subscription.dtos.subscriptionPlan.response.SubscriptionPlanResponse;
import sba301.hrtech.subscription.entities.Feature;
import sba301.hrtech.subscription.entities.PlanFeature;
import sba301.hrtech.subscription.entities.SubscriptionPlan;
import sba301.hrtech.subscription.mapper.SubscriptionPlanMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionPlanServiceImpl implements ISubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final FeatureRepository featureRepository;
    private final PlanFeatureRepository planFeatureRepository;

    private final SubscriptionPlanMapper subscriptionPlanMapper;

    // =========================
    // GET ACTIVE (PUBLIC)
    // =========================
    @Override
    public List<SubscriptionPlanResponse> getActivePlans() {
        return subscriptionPlanRepository.findByIsActiveTrue()
                .stream()
                .map(subscriptionPlanMapper::toResponse)
                .toList();
    }

    // =========================
    // GET ALL (ADMIN)
    // =========================
    @Override
    public List<SubscriptionPlanResponse> getAll() {
        return subscriptionPlanRepository.findAll()
                .stream()
                .map(subscriptionPlanMapper::toResponse)
                .toList();
    }

    @Override
    public SubscriptionPlan getById(UUID id) {
        return subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND,
                        "Subscription plan not found"));
    }

    // =========================
    // CREATE
    // =========================
    @Override
    public SubscriptionPlanResponse create(SubscriptionPlanRequest request) {
        // Create SubscriptionPlan entity from request
        SubscriptionPlan plan = subscriptionPlanMapper.toEntity(request);

        // Save the plan to get an ID for the PlanFeature associations
        savePlanFeatures(plan, request.features());

        return subscriptionPlanMapper.toResponse(subscriptionPlanRepository.save(plan));
    }

    // =========================
    // UPDATE
    // =========================
    @Override
    public SubscriptionPlanResponse update(UUID id, SubscriptionPlanRequest request) {

        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND,
                        "Subscription plan not found"));

        subscriptionPlanMapper.updateEntity(request, plan);

        planFeatureRepository.deleteByPlanId(id);

        savePlanFeatures(plan, request.features());

        return subscriptionPlanMapper.toResponse(plan);
    }

    @Override
    public void delete(UUID id) {

        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND,
                        "Subscription plan not found"));
        subscriptionPlanRepository.delete(plan);
    }

    private void savePlanFeatures(SubscriptionPlan plan, List<PlanFeatureRequest> featureRequests) {
        for (PlanFeatureRequest featureRequest : featureRequests) {
            Feature feature = featureRepository.findById(featureRequest.id())
                    .orElseThrow(() -> new AppException(
                            ErrorCode.FEATURE_NOT_FOUND,
                            "Feature not found"));

            PlanFeature planFeature = PlanFeature.builder()
                    .plan(plan)
                    .feature(feature)
                    .quota(featureRequest.quota())
                    .build();

            planFeatureRepository.save(planFeature);
        }
    }
}
