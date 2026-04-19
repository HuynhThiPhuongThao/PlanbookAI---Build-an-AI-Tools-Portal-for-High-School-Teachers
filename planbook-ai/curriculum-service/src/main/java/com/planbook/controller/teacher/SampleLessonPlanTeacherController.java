package com.planbook.controller.teacher;

import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.service.teacher.SampleLessonPlanTeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sample-lesson-plans")
public class SampleLessonPlanTeacherController {

    private final SampleLessonPlanTeacherService sampleLessonPlanTeacherService;

    public SampleLessonPlanTeacherController(SampleLessonPlanTeacherService sampleLessonPlanTeacherService) {
        this.sampleLessonPlanTeacherService = sampleLessonPlanTeacherService;
    }

    @GetMapping("/approved")
    public ResponseEntity<List<SampleLessonPlanResponse>> getApprovedSamples(
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long curriculumTemplateId
    ) {
        return ResponseEntity.ok(
                sampleLessonPlanTeacherService.getApprovedSamples(topicId, curriculumTemplateId)
        );
    }
}