package sba301.hrtech.subscription.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.shared.response.ApiResponse;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionService;
import sba301.hrtech.subscription.dtos.response.MySubscriptionResponse;

import java.util.UUID;

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
