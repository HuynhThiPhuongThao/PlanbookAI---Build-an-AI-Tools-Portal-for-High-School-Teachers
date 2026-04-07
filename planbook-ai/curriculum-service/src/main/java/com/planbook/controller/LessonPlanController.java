package com.planbook.controller;

import com.planbook.entity.LessonPlan;
import com.planbook.service.LessonPlanService;

import java.util.List;

import org.springframework.http.HttpStatus;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.planbook.dto.LessonPlanResponse;

@RestController
@RequestMapping("/api/lesson-plans")
public class LessonPlanController {
    private final LessonPlanService lessonPlanService;

    public LessonPlanController(LessonPlanService lessonPlanService) {
        this.lessonPlanService = lessonPlanService;
    }

    // GET /api/lesson-plans?teacherId=123
    @GetMapping
    public ResponseEntity<List<LessonPlanResponse>> getLessonPlans(@RequestParam Long teacherId) {
        return ResponseEntity.ok(lessonPlanService.getLessonPlansByTeacher(teacherId));
    }

    // POST /api/lesson-plans
    @PostMapping
    public ResponseEntity<LessonPlanResponse> addLessonPlan(@RequestBody @Valid LessonPlan lessonPlan,
                                                    @RequestParam Long teacherId) {
    //    lessonPlan.setTeacherId(teacherId); // gán teacherId từ query param
        LessonPlanResponse saved = lessonPlanService.addLessonPlan(lessonPlan, teacherId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/lesson-plans/{id}
    @PutMapping("/{id}")
    public ResponseEntity<LessonPlanResponse> updateLessonPlan(@PathVariable Long id,
                                                       @RequestBody @Valid LessonPlan lessonPlan,
                                                       @RequestParam Long teacherId) {
        LessonPlanResponse updated = lessonPlanService.updateLessonPlan(id, lessonPlan, teacherId);
        return ResponseEntity.ok(updated);
    }
}
