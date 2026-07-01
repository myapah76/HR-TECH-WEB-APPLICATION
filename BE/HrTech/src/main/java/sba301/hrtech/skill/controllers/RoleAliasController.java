package sba301.hrtech.skill.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.shared.response.ApiResponse;
import sba301.hrtech.skill.abstractions.services.IRoleAliasService;
import sba301.hrtech.skill.dtos.request.RoleAliasRequest;
import sba301.hrtech.skill.dtos.response.RoleAliasResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/role-aliases")
@RequiredArgsConstructor
public class RoleAliasController {

    private final IRoleAliasService roleAliasService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleAliasResponse>>> getAllRoleAliases() {
        return ResponseEntity.ok(ApiResponse.success(roleAliasService.getAllRoleAliases()));
    }

    @GetMapping("/canonical")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctCanonicalRoles() {
        return ResponseEntity.ok(ApiResponse.success(roleAliasService.getDistinctCanonicalRoles()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleAliasResponse>> createRoleAlias(@Valid @RequestBody RoleAliasRequest request) {
        RoleAliasResponse response = roleAliasService.createRoleAlias(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleAliasResponse>> updateRoleAlias(
            @PathVariable UUID id,
            @Valid @RequestBody RoleAliasRequest request) {
        RoleAliasResponse response = roleAliasService.updateRoleAlias(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoleAlias(@PathVariable UUID id) {
        roleAliasService.deleteRoleAlias(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // === Group operations for Canonical Roles (with Neo4j cascades) ===

    @PutMapping("/canonical/{oldName}")
    public ResponseEntity<ApiResponse<Void>> renameCanonicalRole(
            @PathVariable String oldName,
            @RequestParam String newName) {
        roleAliasService.renameCanonicalRole(oldName, newName);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/canonical/{name}")
    public ResponseEntity<ApiResponse<Void>> deleteCanonicalRole(@PathVariable String name) {
        roleAliasService.deleteCanonicalRole(name);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
