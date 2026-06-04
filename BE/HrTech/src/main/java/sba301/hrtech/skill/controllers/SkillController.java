package sba301.hrtech.skill.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.skill.abstractions.services.ISkillService;
import sba301.hrtech.skill.dtos.request.CreateSkillRequest;
import sba301.hrtech.skill.dtos.request.UpdateSkillRequest;
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
    public ResponseEntity<SkillResponse> createSkill(@Valid @RequestBody CreateSkillRequest request) {
        SkillResponse response = skillService.createSkill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillResponse> updateSkill(
            @PathVariable String id,
            @RequestBody UpdateSkillRequest request) {
        return ResponseEntity.ok(skillService.updateSkill(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable String id) {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SkillWithRelationsResponse> getSkillById(@PathVariable String id) {
        return ResponseEntity.ok(skillService.getSkillById(id));
    }

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/search")
    public ResponseEntity<List<SkillResponse>> searchSkills(@RequestParam String keyword) {
        return ResponseEntity.ok(skillService.searchSkills(keyword));
    }

    // === Admin Review ===

    @GetMapping("/pending")
    public ResponseEntity<List<SkillResponse>> getPendingSkills() {
        return ResponseEntity.ok(skillService.getPendingSkills());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<SkillResponse> approveSkill(@PathVariable String id) {
        return ResponseEntity.ok(skillService.approveSkill(id));
    }

    @DeleteMapping("/{id}/reject")
    public ResponseEntity<Void> rejectSkill(@PathVariable String id) {
        skillService.rejectSkill(id);
        return ResponseEntity.noContent().build();
    }

    // === Relationships ===

    @PostMapping("/{id}/synonyms/{synonymId}")
    public ResponseEntity<Void> addSynonym(
            @PathVariable String id,
            @PathVariable String synonymId) {
        skillService.addSynonym(id, synonymId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/related/{relatedId}")
    public ResponseEntity<Void> addRelatedSkill(
            @PathVariable String id,
            @PathVariable String relatedId) {
        skillService.addRelatedSkill(id, relatedId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{parentId}/children/{childId}")
    public ResponseEntity<Void> addParentChild(
            @PathVariable String parentId,
            @PathVariable String childId) {
        skillService.addParentChild(parentId, childId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<SkillResponse>> getRelatedSkills(@PathVariable String id) {
        return ResponseEntity.ok(skillService.getRelatedSkills(id));
    }

    // === Embedding-based Search ===

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<SkillResponse>> findSimilarSkills(
            @PathVariable String id,
            @RequestParam(defaultValue = "5") int topK) {
        return ResponseEntity.ok(skillService.findSimilarSkills(id, topK));
    }
}
