package hrtech.subscription.mapper;

import org.mapstruct.*;
import hrtech.subscription.dtos.subscriptionPlan.request.SubscriptionPlanRequest;
import hrtech.subscription.dtos.subscriptionPlan.response.PlanFeatureResponse;
import hrtech.subscription.dtos.subscriptionPlan.response.SubscriptionPlanResponse;
import hrtech.subscription.entities.CandidatePlanFeature;
import hrtech.subscription.entities.CandidateSubscriptionPlan;
import hrtech.subscription.entities.CompanyPlanFeature;
import hrtech.subscription.entities.CompanySubscriptionPlan;
import hrtech.subscription.entities.Feature;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SubscriptionPlanMapper {

    // ==========================================
    // CANDIDATE MAPPING
    // ==========================================
    CandidateSubscriptionPlan toCandidateEntity(SubscriptionPlanRequest request);

    @Mapping(target = "features", source = "planFeatures", qualifiedByName = "candidatePlanFeatureToResponse")
    @Mapping(target = "subscriptionType", constant = "CANDIDATE")
    SubscriptionPlanResponse toCandidateResponse(CandidateSubscriptionPlan subscriptionPlan);

    void updateCandidateEntity(SubscriptionPlanRequest request, @MappingTarget CandidateSubscriptionPlan subscriptionPlan);

    @Named("candidatePlanFeatureToResponse")
    default PlanFeatureResponse candidatePlanFeatureToResponse(CandidatePlanFeature planFeature) {
        if (planFeature == null || planFeature.getFeature() == null) return null;
        Feature feature = planFeature.getFeature();
        return PlanFeatureResponse.builder()
                .code(feature.getCode())
                .name(feature.getName())
                .description(feature.getDescription())
                .aiCreditCost(planFeature.getAiCreditCost())
                .build();
    }

    // ==========================================
    // COMPANY MAPPING
    // ==========================================
    CompanySubscriptionPlan toCompanyEntity(SubscriptionPlanRequest request);

    @Mapping(target = "features", source = "planFeatures", qualifiedByName = "companyPlanFeatureToResponse")
    @Mapping(target = "subscriptionType", constant = "COMPANY")
    SubscriptionPlanResponse toCompanyResponse(CompanySubscriptionPlan subscriptionPlan);

    void updateCompanyEntity(SubscriptionPlanRequest request, @MappingTarget CompanySubscriptionPlan subscriptionPlan);

    @Named("companyPlanFeatureToResponse")
    default PlanFeatureResponse companyPlanFeatureToResponse(CompanyPlanFeature planFeature) {
        if (planFeature == null || planFeature.getFeature() == null) return null;
        Feature feature = planFeature.getFeature();
        return PlanFeatureResponse.builder()
                .code(feature.getCode())
                .name(feature.getName())
                .description(feature.getDescription())
                .aiCreditCost(planFeature.getAiCreditCost())
                .build();
    }
}
