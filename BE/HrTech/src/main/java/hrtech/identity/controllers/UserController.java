package hrtech.identity.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.identity.dtos.user.request.ChangePasswordRequest;
import hrtech.identity.dtos.user.request.CreateUserRequest;
import hrtech.identity.dtos.user.request.UpdateUserBlockStatusRequest;
import hrtech.identity.dtos.user.request.UserCommonRequest;
import hrtech.identity.dtos.user.response.UserResponse;
import hrtech.shared.response.ApiResponse;

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
        return ResponseEntity.ok(ApiResponse.success(userService.getUserResponseById(id), "User retrieved successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll(), "Users retrieved successfully"));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAdminUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isBlocked,
            @RequestParam(required = false) String email,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getAdminUsers(role, isBlocked, email, pageable),
                "Users retrieved successfully"
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @RequestBody UserCommonRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.update(request), "User updated successfully"));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<UserResponse>> updatePassword(
            @RequestBody ChangePasswordRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.changePassword(request), "Password changed successfully"));
    }

    @PatchMapping("/{userId}/block-status")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<UserResponse>> updateBlockStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserBlockStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateBlockStatus(userId, request.getIsBlocked()),
                "User blocked status updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID id
    ) {
        userService.deleteById(id);

        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
