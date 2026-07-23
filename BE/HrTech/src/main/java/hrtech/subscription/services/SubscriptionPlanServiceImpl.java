package hrtech.subscription.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.subscription.abstractions.repositories.CandidatePlanFeatureRepository;
import hrtech.subscription.abstractions.repositories.CandidateSubscriptionPlanRepository;
import hrtech.subscription.abstractions.repositories.CompanyPlanFeatureRepository;
import hrtech.subscription.abstractions.repositories.CompanySubscriptionPlanRepository;
import hrtech.subscription.abstractions.repositories.FeatureRepository;
import hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import hrtech.subscription.dtos.subscriptionPlan.request.PlanFeatureRequest;
import hrtech.subscription.dtos.subscriptionPlan.request.SubscriptionPlanRequest;
import hrtech.subscription.dtos.subscriptionPlan.response.SubscriptionPlanResponse;
import hrtech.subscription.entities.CandidatePlanFeature;
import hrtech.subscription.entities.CandidateSubscriptionPlan;
import hrtech.subscription.entities.CompanyPlanFeature;
import hrtech.subscription.entities.CompanySubscriptionPlan;
import hrtech.subscription.entities.Feature;
import hrtech.subscription.entities.enums.SubscriptionType;
import hrtech.subscription.mapper.SubscriptionPlanMapper;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionPlanServiceImpl implements ISubscriptionPlanService {

    private final CandidateSubscriptionPlanRepository candidateSubscriptionPlanRepository;
    private final CompanySubscriptionPlanRepository companySubscriptionPlanRepository;

    private final CandidatePlanFeatureRepository candidatePlanFeatureRepository;
    private final CompanyPlanFeatureRepository companyPlanFeatureRepository;

    private final FeatureRepository featureRepository;
    private final SubscriptionPlanMapper subscriptionPlanMapper;

    @Override
    public List<SubscriptionPlanResponse> getActivePlans() {
        List<SubscriptionPlanResponse> responses = new ArrayList<>();
        responses.addAll(candidateSubscriptionPlanRepository.findByIsActiveTrueOrderByPriceAsc().stream()
                .map(subscriptionPlanMapper::toCandidateResponse).toList());
        responses.addAll(companySubscriptionPlanRepository.findByIsActiveTrueOrderByPriceAsc().stream()
                .map(subscriptionPlanMapper::toCompanyResponse).toList());
        return responses;
    }

    @Override
    public Object findByName(String name) {
        Optional<CandidateSubscriptionPlan> candidateOpt = candidateSubscriptionPlanRepository.findByNameAndIsActiveTrue(name);
        if (candidateOpt.isPresent()) return candidateOpt.get();

        Optional<CompanySubscriptionPlan> companyOpt = companySubscriptionPlanRepository.findByNameAndIsActiveTrue(name);
        if (companyOpt.isPresent()) return companyOpt.get();

        throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription plan not found");
    }

    @Override
    public List<SubscriptionPlanResponse> getAll() {
        List<SubscriptionPlanResponse> responses = new ArrayList<>();
        responses.addAll(candidateSubscriptionPlanRepository.findAllByOrderByPriceAsc().stream()
                .map(subscriptionPlanMapper::toCandidateResponse).toList());
        responses.addAll(companySubscriptionPlanRepository.findAllByOrderByPriceAsc().stream()
                .map(subscriptionPlanMapper::toCompanyResponse).toList());
        return responses;
    }

    @Override
    public Object getById(UUID id) {
        Optional<CandidateSubscriptionPlan> candidateOpt = candidateSubscriptionPlanRepository.findById(id);
        if (candidateOpt.isPresent()) return candidateOpt.get();

        Optional<CompanySubscriptionPlan> companyOpt = companySubscriptionPlanRepository.findById(id);
        if (companyOpt.isPresent()) return companyOpt.get();

        throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription plan not found");
    }
    private void validateFreePlanIsActive(SubscriptionPlanRequest request) {
        if (request.price() != null && request.price() == 0 && request.isActive() != null && !request.isActive()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Gói cước Miễn phí phải luôn ở trạng thái hoạt động");
        }
    }

    @Override
    public SubscriptionPlanResponse create(SubscriptionPlanRequest request) {
        validateFreePlanIsActive(request);
        if (request.subscriptionType() == SubscriptionType.CANDIDATE) {
            CandidateSubscriptionPlan plan = subscriptionPlanMapper.toCandidateEntity(request);
            plan = candidateSubscriptionPlanRepository.save(plan);
            saveCandidatePlanFeatures(plan, request.features());
            return subscriptionPlanMapper.toCandidateResponse(plan);
        } else {
            CompanySubscriptionPlan plan = subscriptionPlanMapper.toCompanyEntity(request);
            plan = companySubscriptionPlanRepository.save(plan);
            saveCompanyPlanFeatures(plan, request.features());
            return subscriptionPlanMapper.toCompanyResponse(plan);
        }
    }

    @Override
    public SubscriptionPlanResponse update(UUID id, SubscriptionPlanRequest request) {
        validateFreePlanIsActive(request);
        if (request.subscriptionType() == SubscriptionType.CANDIDATE) {
            CandidateSubscriptionPlan plan = candidateSubscriptionPlanRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription plan not found"));
            subscriptionPlanMapper.updateCandidateEntity(request, plan);
            updateCandidatePlanFeatures(plan, request.features());
            plan = candidateSubscriptionPlanRepository.save(plan);
            return subscriptionPlanMapper.toCandidateResponse(plan);
        } else {
            CompanySubscriptionPlan plan = companySubscriptionPlanRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription plan not found"));
            subscriptionPlanMapper.updateCompanyEntity(request, plan);
            updateCompanyPlanFeatures(plan, request.features());
            plan = companySubscriptionPlanRepository.save(plan);
            return subscriptionPlanMapper.toCompanyResponse(plan);
        }
    }

    private void updateCandidatePlanFeatures(CandidateSubscriptionPlan plan, List<PlanFeatureRequest> featureRequests) {
        if (featureRequests == null) return;

        List<CandidatePlanFeature> currentFeatures = plan.getPlanFeatures();
        if (currentFeatures == null) {
            currentFeatures = new ArrayList<>();
            plan.setPlanFeatures(currentFeatures);
        }

        Map<UUID, PlanFeatureRequest> requestedMap = new HashMap<>();
        for (PlanFeatureRequest req : featureRequests) {
            requestedMap.put(req.id(), req);
        }

        currentFeatures.removeIf(pf -> !requestedMap.containsKey(pf.getFeature().getId()));

        for (PlanFeatureRequest req : featureRequests) {
            boolean exists = false;
            for (CandidatePlanFeature pf : currentFeatures) {
                if (pf.getFeature().getId().equals(req.id())) {
                    pf.setAiCreditCost(req.aiCreditCost());
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                Feature feature = featureRepository.findById(req.id())
                        .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND, "Feature not found"));
                currentFeatures.add(CandidatePlanFeature.builder()
                        .plan(plan)
                        .feature(feature)
                        .aiCreditCost(req.aiCreditCost())
                        .build());
            }
        }
    }

    private void updateCompanyPlanFeatures(CompanySubscriptionPlan plan, List<PlanFeatureRequest> featureRequests) {
        if (featureRequests == null) return;

        List<CompanyPlanFeature> currentFeatures = plan.getPlanFeatures();
        if (currentFeatures == null) {
            currentFeatures = new ArrayList<>();
            plan.setPlanFeatures(currentFeatures);
        }

        Map<UUID, PlanFeatureRequest> requestedMap = new HashMap<>();
        for (PlanFeatureRequest req : featureRequests) {
            requestedMap.put(req.id(), req);
        }

        currentFeatures.removeIf(pf -> !requestedMap.containsKey(pf.getFeature().getId()));

        for (PlanFeatureRequest req : featureRequests) {
            boolean exists = false;
            for (CompanyPlanFeature pf : currentFeatures) {
                if (pf.getFeature().getId().equals(req.id())) {
                    pf.setAiCreditCost(req.aiCreditCost());
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                Feature feature = featureRepository.findById(req.id())
                        .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND, "Feature not found"));
                currentFeatures.add(CompanyPlanFeature.builder()
                        .plan(plan)
                        .feature(feature)
                        .aiCreditCost(req.aiCreditCost())
                        .build());
            }
        }
    }


    @Override
    public void delete(UUID id) {
        Optional<CandidateSubscriptionPlan> candidateOpt = candidateSubscriptionPlanRepository.findById(id);
        if (candidateOpt.isPresent()) {
            candidateSubscriptionPlanRepository.delete(candidateOpt.get());
            return;
        }

        Optional<CompanySubscriptionPlan> companyOpt = companySubscriptionPlanRepository.findById(id);
        if (companyOpt.isPresent()) {
            companySubscriptionPlanRepository.delete(companyOpt.get());
            return;
        }

        throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription plan not found");
    }

    private void saveCandidatePlanFeatures(CandidateSubscriptionPlan plan, List<PlanFeatureRequest> featureRequests) {
        if (featureRequests == null) return;
        for (PlanFeatureRequest featureRequest : featureRequests) {
            Feature feature = featureRepository.findById(featureRequest.id())
                    .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND, "Feature not found"));

            candidatePlanFeatureRepository.save(CandidatePlanFeature.builder()
                    .plan(plan)
                    .feature(feature)
                    .aiCreditCost(featureRequest.aiCreditCost())
                    .build());
        }
    }

    private void saveCompanyPlanFeatures(CompanySubscriptionPlan plan, List<PlanFeatureRequest> featureRequests) {
        if (featureRequests == null) return;
        for (PlanFeatureRequest featureRequest : featureRequests) {
            Feature feature = featureRepository.findById(featureRequest.id())
                    .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND, "Feature not found"));

            companyPlanFeatureRepository.save(CompanyPlanFeature.builder()
                    .plan(plan)
                    .feature(feature)
                    .aiCreditCost(featureRequest.aiCreditCost())
                    .build());
        }
    }
}
