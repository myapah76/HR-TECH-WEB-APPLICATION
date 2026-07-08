package hrtech.subscription.abstractions.services;

import java.util.UUID;

public interface ICreditService {

    void deductCandidateQuota(UUID userId, String featureCode, int amount);

    void deductCompanyFeatureQuota(UUID userId, String featureCode, int amount);

    boolean hasCandidateFeatureAccess(UUID userId, String featureCode);

    boolean hasCompanyFeatureAccess(UUID userId, String featureCode);
}
