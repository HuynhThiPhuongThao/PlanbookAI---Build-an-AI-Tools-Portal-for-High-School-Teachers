package com.planbook.controller.staff;

import com.planbook.dto.staff.SampleLessonPlanRequest;
import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.security.AuthUtil;
import com.planbook.service.staff.SampleLessonPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sample-lesson-plans")
public class SampleLessonPlanController {

    private final SampleLessonPlanService sampleLessonPlanService;
    private final AuthUtil authUtil;

    public SampleLessonPlanController(SampleLessonPlanService sampleLessonPlanService, AuthUtil authUtil) {
        this.sampleLessonPlanService = sampleLessonPlanService;
        this.authUtil = authUtil;
    }

    @PostMapping
    public ResponseEntity<SampleLessonPlanResponse> createSample(@RequestBody SampleLessonPlanRequest request, Authentication authentication) {
        Long staffId = authUtil.extractStaffId(authentication);
        return ResponseEntity.ok(sampleLessonPlanService.createSample(request, staffId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SampleLessonPlanResponse>> getMySamples(Authentication authentication) {
        Long staffId = authUtil.extractStaffId(authentication);
        return ResponseEntity.ok(sampleLessonPlanService.getMySamples(staffId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SampleLessonPlanResponse> getSampleById(@PathVariable Long id, Authentication authentication) {
        Long staffId = authUtil.extractStaffId(authentication);
        return ResponseEntity.ok(sampleLessonPlanService.getSampleById(id, staffId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SampleLessonPlanResponse> updateSample(
            @PathVariable Long id,
            @RequestBody SampleLessonPlanRequest request,
            Authentication authentication
    ) {
        Long staffId = authUtil.extractStaffId(authentication);
        return ResponseEntity.ok(sampleLessonPlanService.updateSample(id, request, staffId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSample(@PathVariable Long id, Authentication authentication) {
        Long staffId = authUtil.extractStaffId(authentication);
        sampleLessonPlanService.deleteSample(id, staffId);
        return ResponseEntity.ok("Deleted sample lesson plan successfully");
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SampleLessonPlanResponse> submitForReview(@PathVariable Long id, Authentication authentication) {
        Long staffId = authUtil.extractStaffId(authentication);
        return ResponseEntity.ok(sampleLessonPlanService.submitForReview(id, staffId));
    }
}