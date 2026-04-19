package com.planbook.controller.manager;

import com.planbook.dto.manager.SampleLessonPlanReviewRequest;
import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.service.manager.SampleLessonPlanReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sample-lesson-plans/review")
public class SampleLessonPlanReviewController {

    private final SampleLessonPlanReviewService sampleLessonPlanReviewService;

    public SampleLessonPlanReviewController(SampleLessonPlanReviewService sampleLessonPlanReviewService) {
        this.sampleLessonPlanReviewService = sampleLessonPlanReviewService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<SampleLessonPlanResponse>> getPendingSamples() {
        return ResponseEntity.ok(sampleLessonPlanReviewService.getPendingSamples());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<SampleLessonPlanResponse> approveSample(
            @PathVariable Long id,
            @RequestBody SampleLessonPlanReviewRequest request
    ) {
        Long managerId = 3L; // TODO: replace with authenticated manager user id from JWT
        return ResponseEntity.ok(sampleLessonPlanReviewService.approveSample(id, request, managerId));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<SampleLessonPlanResponse> rejectSample(
            @PathVariable Long id,
            @RequestBody SampleLessonPlanReviewRequest request
    ) {
        Long managerId = 3L; // TODO: replace with authenticated manager user id from JWT
        return ResponseEntity.ok(sampleLessonPlanReviewService.rejectSample(id, request, managerId));
    }
}