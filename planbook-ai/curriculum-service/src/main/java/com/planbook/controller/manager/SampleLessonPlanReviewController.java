package com.planbook.controller.manager;

import com.planbook.dto.manager.SampleLessonPlanReviewRequest;
import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.security.AuthUtil;
import com.planbook.service.manager.SampleLessonPlanReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sample-lesson-plans/review")
public class SampleLessonPlanReviewController {

    private final SampleLessonPlanReviewService sampleLessonPlanReviewService;
    private final AuthUtil authUtil;

    public SampleLessonPlanReviewController(SampleLessonPlanReviewService sampleLessonPlanReviewService, AuthUtil authUtil) {
        this.sampleLessonPlanReviewService = sampleLessonPlanReviewService;
        this.authUtil = authUtil;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<SampleLessonPlanResponse>> getPendingSamples() {
        return ResponseEntity.ok(sampleLessonPlanReviewService.getPendingSamples());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<SampleLessonPlanResponse> approveSample(
            @PathVariable Long id,
            @RequestBody SampleLessonPlanReviewRequest request,
            Authentication authentication
    ) {
        Long managerId = authUtil.extractManagerId(authentication);
        return ResponseEntity.ok(sampleLessonPlanReviewService.approveSample(id, request, managerId));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<SampleLessonPlanResponse> rejectSample(
            @PathVariable Long id,
            @RequestBody SampleLessonPlanReviewRequest request,
            Authentication authentication
    ) {
        Long managerId = authUtil.extractManagerId(authentication);
        return ResponseEntity.ok(sampleLessonPlanReviewService.rejectSample(id, request, managerId));
    }
}