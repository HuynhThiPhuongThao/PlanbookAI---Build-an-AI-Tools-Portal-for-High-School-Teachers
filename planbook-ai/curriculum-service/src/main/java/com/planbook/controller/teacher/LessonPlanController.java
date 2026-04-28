package com.planbook.controller.teacher;

import com.planbook.service.teacher.LessonPlanService;
import com.planbook.dto.teacher.LessonPlanRequest;
import com.planbook.dto.teacher.LessonPlanResponse;
import com.planbook.security.AuthUtil;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/lesson-plans")
public class LessonPlanController {
    private final LessonPlanService lessonPlanService;
    private final AuthUtil authUtil;

    public LessonPlanController(LessonPlanService lessonPlanService, AuthUtil authUtil) {
        this.lessonPlanService = lessonPlanService;
        this.authUtil = authUtil;
    }

    // GET /api/lesson-plans
    //teacher được lấy từ JWT
    @GetMapping
    public ResponseEntity<List<LessonPlanResponse>> getLessonPlans(Authentication authentication) {
        Long teacherId = authUtil.extractTeacherId(authentication);
        return ResponseEntity.ok(lessonPlanService.getLessonPlansByTeacher(teacherId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonPlanResponse> getLessonPlanById(@PathVariable Long id,
                                                                Authentication authentication) {
        Long teacherId = authUtil.extractTeacherId(authentication);
        return ResponseEntity.ok(lessonPlanService.getLessonPlanById(id, teacherId));
    }

    // POST /api/lesson-plans
    @PostMapping
    public ResponseEntity<LessonPlanResponse> addLessonPlan(@RequestBody @Valid LessonPlanRequest request,
                                                            Authentication authentication) {
        Long teacherId = authUtil.extractTeacherId(authentication);
        LessonPlanResponse saved = lessonPlanService.addLessonPlan(request, teacherId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/lesson-plans/{id}
    @PutMapping("/{id}")
    public ResponseEntity<LessonPlanResponse> updateLessonPlan(@PathVariable Long id,
                                                               @RequestBody @Valid LessonPlanRequest request,
                                                               Authentication authentication) {
        Long teacherId = authUtil.extractTeacherId(authentication);
        LessonPlanResponse updated = lessonPlanService.updateLessonPlan(id, request, teacherId);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/lesson-plans/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLessonPlan(@PathVariable Long id, Authentication authentication) {
        Long teacherId = authUtil.extractTeacherId(authentication);
        lessonPlanService.deleteLessonPlan(id, teacherId);
        return ResponseEntity.ok("Lesson plan deleted successfully");
    }
}
