package sba301.hrtech.subscription.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.shared.common.ApiResponse;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import sba301.hrtech.subscription.dtos.subscriptionPlan.request.SubscriptionPlanRequest;
import sba301.hrtech.subscription.dtos.subscriptionPlan.response.SubscriptionPlanResponse;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscription-plans")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final ISubscriptionPlanService subscriptionPlanService;

    // PUBLIC - xem các gói active
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getActivePlans() {

        List<SubscriptionPlanResponse> plans = subscriptionPlanService.getActivePlans();

        return ResponseEntity.ok(
                ApiResponse.success(plans, "Active subscription plans retrieved successfully")
        );
    }

    // ADMIN - tạo plan
    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> createSubscriptionPlan(
            @Valid @RequestBody SubscriptionPlanRequest request
    ) {
        SubscriptionPlanResponse response = subscriptionPlanService.create(request);

        return ResponseEntity
                .created(URI.create("/api/subscription-plans/" + response.id()))
                .body(ApiResponse.success(response, "Subscription plan created successfully"));
    }

    // ADMIN - update
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> update(
            @PathVariable UUID id,
            @RequestBody SubscriptionPlanRequest request
    ) {

        SubscriptionPlanResponse response = subscriptionPlanService.update(id, request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Subscription plan updated successfully")
        );
    }

    // ADMIN - delete soft
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        subscriptionPlanService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Subscription plan deleted successfully")
        );
    }

    // ADMIN - list all
    @GetMapping()
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getAll() {
        List<SubscriptionPlanResponse> responses = subscriptionPlanService.getAll();
        return ResponseEntity.ok(
                ApiResponse.success(responses, "All subscription plans retrieved successfully")
        );
    }
}
