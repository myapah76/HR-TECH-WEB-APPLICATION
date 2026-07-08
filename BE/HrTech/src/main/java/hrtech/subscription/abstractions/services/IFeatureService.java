package hrtech.subscription.abstractions.services;

import hrtech.subscription.dtos.feature.request.CreateFeatureRequest;
import hrtech.subscription.dtos.feature.request.UpdateFeatureRequest;
import hrtech.subscription.dtos.feature.response.FeatureResponse;

import java.util.List;
import java.util.UUID;

public interface IFeatureService {
    FeatureResponse create(CreateFeatureRequest request);

    FeatureResponse update(UUID id, UpdateFeatureRequest request);

    FeatureResponse getById(UUID id);

    List<FeatureResponse> getAll();

    void delete(UUID id);
}
