package sba301.hrtech.subscription.mapper;

import org.mapstruct.*;
import sba301.hrtech.subscription.dtos.subscriptionPlan.request.SubscriptionPlanRequest;
import sba301.hrtech.subscription.dtos.subscriptionPlan.response.PlanFeatureResponse;
import sba301.hrtech.subscription.dtos.subscriptionPlan.response.SubscriptionPlanResponse;
import sba301.hrtech.subscription.entities.Feature;
import sba301.hrtech.subscription.entities.PlanFeature;
import sba301.hrtech.subscription.entities.SubscriptionPlan;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SubscriptionPlanMapper {
    SubscriptionPlan toEntity(SubscriptionPlanRequest request);

    @Mapping(
            target = "features",
            source = "planFeatures",
            qualifiedByName = "planFeatureToResponse"
    )
    SubscriptionPlanResponse toResponse(SubscriptionPlan subscriptionPlan);

    void updateEntity(
            SubscriptionPlanRequest request,
            @MappingTarget SubscriptionPlan subscriptionPlan
    );

    @Named("planFeatureToResponse")
    default PlanFeatureResponse planFeatureToResponse(PlanFeature planFeature) {

        Feature feature = planFeature.getFeature();

        return PlanFeatureResponse.builder()
                .code(feature.getCode())
                .name(feature.getName())
                .description(feature.getDescription())
                .quota(planFeature.getQuota())
                .build();
    }
}
