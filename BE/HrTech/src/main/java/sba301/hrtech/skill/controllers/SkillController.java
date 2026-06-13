package sba301.hrtech.skill.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.shared.common.ApiResponse;
import sba301.hrtech.skill.abstractions.services.ISkillService;
import sba301.hrtech.skill.dtos.request.CreateSkillRequest;
import sba301.hrtech.skill.dtos.request.UpdateSkillRequest;
import sba301.hrtech.skill.dtos.response.PendingRelationshipResponse;
import sba301.hrtech.skill.dtos.response.SkillResponse;
import sba301.hrtech.skill.dtos.response.SkillWithRelationsResponse;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final ISkillService skillService;

    // === CRUD ===

    @PostMapping
    public ResponseEntity<ApiResponse<SkillResponse>> createSkill(@Valid @RequestBody CreateSkillRequest request) {
        SkillResponse response = skillService.createSkill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SkillResponse>> updateSkill(
            @PathVariable String id,
            @RequestBody UpdateSkillRequest request) {
        return ResponseEntity.ok(ApiResponse.success(skillService.updateSkill(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable String id) {
        skillService.deleteSkill(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SkillWithRelationsResponse>> getSkillById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(skillService.getSkillById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getAllSkills() {
        return ResponseEntity.ok(ApiResponse.success(skillService.getAllSkills()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SkillResponse>>> searchSkills(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(skillService.searchSkills(keyword)));
    }

    // === Admin Review ===

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getPendingSkills() {
        return ResponseEntity.ok(ApiResponse.success(skillService.getPendingSkills()));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SkillResponse>> approveSkill(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(skillService.approveSkill(id)));
    }

    @DeleteMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectSkill(@PathVariable String id) {
        skillService.rejectSkill(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/relationships/pending")
    public ResponseEntity<ApiResponse<List<PendingRelationshipResponse>>> getPendingRelationships() {
        return ResponseEntity.ok(ApiResponse.success(skillService.getPendingRelationships()));
    }

    @PutMapping("/{sourceId}/relationships/{targetId}/approve")
    public ResponseEntity<ApiResponse<Void>> approvePendingRelationship(
            @PathVariable String sourceId,
            @PathVariable String targetId,
            @RequestParam String type) {
        skillService.approvePendingRelationship(sourceId, targetId, type);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{sourceId}/relationships/{targetId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectPendingRelationship(
            @PathVariable String sourceId,
            @PathVariable String targetId,
            @RequestParam String type) {
        skillService.rejectPendingRelationship(sourceId, targetId, type);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // === Relationships ===

    @PostMapping("/{id}/synonyms/{synonymId}")
    public ResponseEntity<ApiResponse<Void>> addSynonym(
            @PathVariable String id,
            @PathVariable String synonymId) {
        skillService.addSynonym(id, synonymId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/related/{relatedId}")
    public ResponseEntity<ApiResponse<Void>> addRelatedSkill(
            @PathVariable String id,
            @PathVariable String relatedId) {
        skillService.addRelatedSkill(id, relatedId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{parentId}/children/{childId}")
    public ResponseEntity<ApiResponse<Void>> addParentChild(
            @PathVariable String parentId,
            @PathVariable String childId) {
        skillService.addParentChild(parentId, childId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getRelatedSkills(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(skillService.getRelatedSkills(id)));
    }

}
