package sba301.hrtech.auth.controllers;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.auth.abstractions.services.IUserService;
import sba301.hrtech.auth.dtos.user.request.ChangePasswordRequest;
import sba301.hrtech.auth.dtos.user.request.CreateUserRequest;
import sba301.hrtech.auth.dtos.user.request.UserCommonRequest;
import sba301.hrtech.auth.dtos.user.response.UserResponse;
import sba301.hrtech.shared.common.ApiResponse;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        UserResponse response = userService.createUser(request);

        return ResponseEntity
                .created(URI.create("/api/users/" + response.getId()))
                .body(ApiResponse.success(response, "User created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id), "User retrieved successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll(), "Users retrieved successfully"));
    }

    @PatchMapping
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @RequestBody UserCommonRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.update(request), "User updated successfully"));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ApiResponse<UserResponse>> updatePassword(
            @RequestBody ChangePasswordRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.changePassword(request), "Password changed successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID id
    ) {
        userService.deleteById(id);

        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
