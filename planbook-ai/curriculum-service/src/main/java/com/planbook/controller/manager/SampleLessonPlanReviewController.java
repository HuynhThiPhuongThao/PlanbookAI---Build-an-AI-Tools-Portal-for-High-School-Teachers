package com.planbook.controller.manager;

import com.planbook.dto.manager.SampleLessonPlanReviewRequest;
import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.security.AuthUtil;
import com.planbook.service.manager.SampleLessonPlanReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/sample-lesson-plans/review")
@Tag(name = "Manager Review", description = "API cho phép Manager duyệt hoặc từ chối giáo án mẫu")
public class SampleLessonPlanReviewController {

    private final SampleLessonPlanReviewService sampleLessonPlanReviewService;
    private final AuthUtil authUtil;

    public SampleLessonPlanReviewController(SampleLessonPlanReviewService sampleLessonPlanReviewService, AuthUtil authUtil) {
        this.sampleLessonPlanReviewService = sampleLessonPlanReviewService;
        this.authUtil = authUtil;
    }

    @Operation(summary = "Lấy danh sách giáo án mẫu đang chờ duyệt")
    @GetMapping("/pending")
    public ResponseEntity<List<SampleLessonPlanResponse>> getPendingSamples() {
        return ResponseEntity.ok(sampleLessonPlanReviewService.getPendingSamples());
    }

    @Operation(summary = "Lấy lịch sử duyệt giáo án mẫu")
    @GetMapping("/history")
    public ResponseEntity<List<SampleLessonPlanResponse>> getReviewHistory() {
        return ResponseEntity.ok(sampleLessonPlanReviewService.getReviewHistory());
    }

    @Operation(summary = "Duyệt một giáo án mẫu")
    @PutMapping("/{id}/approve")
    public ResponseEntity<SampleLessonPlanResponse> approveSample(
            @PathVariable Long id,
            @RequestBody SampleLessonPlanReviewRequest request,
            Authentication authentication
    ) {
        Long managerId = authUtil.extractManagerId(authentication);
        return ResponseEntity.ok(sampleLessonPlanReviewService.approveSample(id, request, managerId));
    }

    @Operation(summary = "Từ chối một giáo án mẫu")
    @PutMapping("/{id}/reject")
    public ResponseEntity<SampleLessonPlanResponse> rejectSample(
            @PathVariable Long id,
            @RequestBody SampleLessonPlanReviewRequest request,
            Authentication authentication
    ) {
        Long managerId = authUtil.extractManagerId(authentication);
        return ResponseEntity.ok(sampleLessonPlanReviewService.rejectSample(id, request, managerId));
    }
}