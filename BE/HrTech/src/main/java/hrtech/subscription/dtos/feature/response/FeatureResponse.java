package hrtech.subscription.dtos.feature.response;

import java.util.UUID;

public record FeatureResponse(
        UUID id,
        String code,
        String name,
        String description
) {
}
