package hrtech.subscription.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import hrtech.shared.response.ApiResponse;
import hrtech.subscription.abstractions.services.ISubscriptionService;
import hrtech.subscription.dtos.response.MySubscriptionResponse;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final ISubscriptionService subscriptionService;

    @GetMapping("/my-current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MySubscriptionResponse>> getMyCurrentSubscription() {
        MySubscriptionResponse response = subscriptionService.getMyCurrentSubscription();
        return ResponseEntity.ok(ApiResponse.success(response, "Current subscription retrieved successfully"));
    }
}
