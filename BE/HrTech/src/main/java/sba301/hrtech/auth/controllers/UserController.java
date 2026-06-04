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
                .body(
                        ApiResponse.<UserResponse>builder()
                                .success(true)
                                .message("User created successfully")
                                .data(response)
                                .build()
                );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("User retrieved successfully")
                        .data(userService.getById(id))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<UserResponse>>builder()
                        .success(true)
                        .message("Users retrieved successfully")
                        .data(userService.getAll())
                        .build()
        );
    }

    @PatchMapping
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @RequestBody UserCommonRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("User updated successfully")
                        .data(userService.update(request))
                        .build()
        );
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ApiResponse<UserResponse>> updatePassword(
            @RequestBody ChangePasswordRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("Password changed successfully")
                        .data(userService.changePassword(request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID id
    ) {
        userService.deleteById(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("User deleted successfully")
                        .build()
        );
    }
}
