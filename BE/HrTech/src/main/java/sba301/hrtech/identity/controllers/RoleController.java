package sba301.hrtech.identity.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.identity.abstractions.services.IRoleService;
import sba301.hrtech.identity.dtos.role.request.CommonRoleRequest;
import sba301.hrtech.identity.dtos.role.request.CreateRoleRequest;
import sba301.hrtech.identity.dtos.role.response.RoleResponse;
import sba301.hrtech.shared.response.ApiResponse;

import java.net.URI;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final IRoleService roleService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(
            @RequestBody CreateRoleRequest request
    ) {
        RoleResponse response = roleService.createRole(request);

        return ResponseEntity.created(
                        URI.create("/api/roles/" + response.getId()))
                .body(ApiResponse.success(response, "Role created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(roleService.getAll(), "Roles retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> getById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(roleService.getById(id), "Role retrieved successfully"));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<RoleResponse>> getByName(
            @PathVariable String name
    ) {
        return ResponseEntity.ok(ApiResponse.success(roleService.getByName(name), "Role retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> update(
            @PathVariable UUID id,
            @RequestBody CommonRoleRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(roleService.update(id, request), "Role updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        roleService.deleteById(id);

        return ResponseEntity.ok(ApiResponse.success(null, "Role deleted successfully"));
    }
}