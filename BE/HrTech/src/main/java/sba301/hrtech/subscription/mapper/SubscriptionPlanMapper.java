package sba301.hrtech.subscription.mapper;

import org.mapstruct.Mapper;
import sba301.hrtech.subscription.dtos.request.SubscriptionPlanRequest;
import sba301.hrtech.subscription.dtos.response.SubscriptionPlanResponse;
import sba301.hrtech.subscription.entities.SubscriptionPlan;

@Mapper(componentModel = "spring")
public interface SubscriptionPlanMapper {
    SubscriptionPlan toEntity(SubscriptionPlanRequest request);

    SubscriptionPlanResponse toResponse(SubscriptionPlan subscriptionPlan);
}
