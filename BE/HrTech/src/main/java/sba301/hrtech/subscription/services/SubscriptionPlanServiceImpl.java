package sba301.hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.subscription.abstractions.repositories.SubscriptionPlanRepository;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import sba301.hrtech.subscription.dtos.request.SubscriptionPlanRequest;
import sba301.hrtech.subscription.dtos.response.SubscriptionPlanResponse;
import sba301.hrtech.subscription.entities.SubscriptionPlan;
import sba301.hrtech.subscription.mapper.SubscriptionPlanMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements ISubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

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
                        HttpStatus.NOT_FOUND,
                        ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND,
                        "Subscription plan not found"));
    }

    // =========================
    // CREATE
    // =========================
    @Override
    public SubscriptionPlanResponse create(SubscriptionPlanRequest request) {

        SubscriptionPlan plan = subscriptionPlanMapper.toEntity(request);

        return subscriptionPlanMapper.toResponse(subscriptionPlanRepository.save(plan));
    }

    // =========================
    // UPDATE
    // =========================
    @Override
    public SubscriptionPlanResponse update(UUID id, SubscriptionPlanRequest request) {

        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND,
                        "Subscription plan not found"));

        plan.setName(request.name());
        plan.setDescription(request.description());
        plan.setPrice(request.price());
        plan.setDurationDays(request.durationDays());
        plan.setPlanType(request.planType());
        plan.setFeatures(request.features());
        plan.setIsActive(request.isActive());

        return subscriptionPlanMapper.toResponse(subscriptionPlanRepository.save(plan));
    }

    // =========================
    // SOFT DELETE
    // =========================
    @Override
    public void delete(UUID id) {

        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND,
                        "Subscription plan not found"));

        plan.setDeleted(true);
        plan.setIsActive(false);

        subscriptionPlanRepository.save(plan);
    }
}
