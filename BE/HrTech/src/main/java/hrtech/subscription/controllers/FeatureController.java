package hrtech.subscription.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import hrtech.shared.response.ApiResponse;
import hrtech.subscription.abstractions.services.IFeatureService;
import hrtech.subscription.dtos.feature.request.CreateFeatureRequest;
import hrtech.subscription.dtos.feature.request.UpdateFeatureRequest;
import hrtech.subscription.dtos.feature.response.FeatureResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/features")
@RequiredArgsConstructor
public class FeatureController {

    private final IFeatureService featureService;

    @PostMapping
    public ApiResponse<FeatureResponse> create(
            @Valid @RequestBody CreateFeatureRequest request) {

        return ApiResponse.success(
                featureService.create(request),
                "Feature created successfully"
        );
    }

    @GetMapping
    public ApiResponse<List<FeatureResponse>> getAll() {

        return ApiResponse.success(
                featureService.getAll(),
                "Features retrieved successfully"
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<FeatureResponse> getById(
            @PathVariable UUID id) {

        return ApiResponse.success(
                featureService.getById(id),
                "Feature retrieved successfully"
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<FeatureResponse> update(
            @PathVariable UUID id,
            @RequestBody UpdateFeatureRequest request) {

        return ApiResponse.success(
                featureService.update(id, request),
                "Feature updated successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable UUID id) {

        featureService.delete(id);

        return ApiResponse.success(null, "Feature deleted successfully");
    }
}
