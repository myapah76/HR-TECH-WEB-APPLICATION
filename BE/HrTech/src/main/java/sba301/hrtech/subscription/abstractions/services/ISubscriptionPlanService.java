package sba301.hrtech.subscription.abstractions.services;

import sba301.hrtech.subscription.dtos.subscriptionPlan.request.SubscriptionPlanRequest;
import sba301.hrtech.subscription.dtos.subscriptionPlan.response.SubscriptionPlanResponse;

import java.util.List;
import java.util.UUID;

public interface ISubscriptionPlanService {
    List<SubscriptionPlanResponse> getActivePlans();
    Object findByName(String name);
    SubscriptionPlanResponse create(SubscriptionPlanRequest request);
    SubscriptionPlanResponse update(UUID id, SubscriptionPlanRequest request);
    void delete(UUID id);
    List<SubscriptionPlanResponse> getAll();
    Object getById(UUID id);
}
