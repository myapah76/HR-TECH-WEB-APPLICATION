package hrtech.subscription.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import hrtech.subscription.dtos.feature.request.CreateFeatureRequest;
import hrtech.subscription.dtos.feature.request.UpdateFeatureRequest;
import hrtech.subscription.dtos.feature.response.FeatureResponse;
import hrtech.subscription.entities.Feature;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface FeatureMapper {
    Feature toEntity(CreateFeatureRequest request);

    FeatureResponse toResponse(Feature feature);

    void updateEntity(UpdateFeatureRequest request, @MappingTarget Feature feature);
}
