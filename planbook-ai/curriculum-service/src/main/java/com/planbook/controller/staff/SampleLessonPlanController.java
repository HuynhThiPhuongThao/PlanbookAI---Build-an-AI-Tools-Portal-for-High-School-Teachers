package com.planbook.controller.staff;

import com.planbook.dto.staff.SampleLessonPlanRequest;
import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.service.staff.SampleLessonPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sample-lesson-plans")
public class SampleLessonPlanController {

    private final SampleLessonPlanService sampleLessonPlanService;

    public SampleLessonPlanController(SampleLessonPlanService sampleLessonPlanService) {
        this.sampleLessonPlanService = sampleLessonPlanService;
    }

    @PostMapping
    public ResponseEntity<SampleLessonPlanResponse> createSample(@RequestBody SampleLessonPlanRequest request) {
        Long staffId = 2L; // TODO: replace with authenticated staff user id from JWT
        return ResponseEntity.ok(sampleLessonPlanService.createSample(request, staffId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SampleLessonPlanResponse>> getMySamples() {
        Long staffId = 2L; // TODO: replace with authenticated staff user id from JWT
        return ResponseEntity.ok(sampleLessonPlanService.getMySamples(staffId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SampleLessonPlanResponse> getSampleById(@PathVariable Long id) {
        Long staffId = 2L; // TODO: replace with authenticated staff user id from JWT
        return ResponseEntity.ok(sampleLessonPlanService.getSampleById(id, staffId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SampleLessonPlanResponse> updateSample(
            @PathVariable Long id,
            @RequestBody SampleLessonPlanRequest request
    ) {
        Long staffId = 2L; // TODO: replace with authenticated staff user id from JWT
        return ResponseEntity.ok(sampleLessonPlanService.updateSample(id, request, staffId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSample(@PathVariable Long id) {
        Long staffId = 2L; // TODO: replace with authenticated staff user id from JWT
        sampleLessonPlanService.deleteSample(id, staffId);
        return ResponseEntity.ok("Deleted sample lesson plan successfully");
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SampleLessonPlanResponse> submitForReview(@PathVariable Long id) {
        Long staffId = 2L; // TODO: replace with authenticated staff user id from JWT
        return ResponseEntity.ok(sampleLessonPlanService.submitForReview(id, staffId));
    }
}