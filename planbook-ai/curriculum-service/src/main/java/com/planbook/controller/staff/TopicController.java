package com.planbook.controller.staff;

import com.planbook.dto.staff.TopicResponse;
import com.planbook.dto.staff.TopicRequest;
import com.planbook.dto.teacher.LessonPlanResponse;
import com.planbook.service.staff.TopicService;
import com.planbook.service.teacher.LessonPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {
    private final TopicService topicService;
    private final LessonPlanService lessonPlanService;

    public TopicController(TopicService topicService, LessonPlanService lessonPlanService) {
        this.topicService = topicService;
        this.lessonPlanService = lessonPlanService;
    }

    @GetMapping
    public ResponseEntity<List<TopicResponse>> getAllTopics() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicResponse> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(topicService.getTopicById(id));
    }

    @GetMapping("/by-chapter")
    public ResponseEntity<List<TopicResponse>> getTopicsByChapter(@RequestParam Long chapterId) {
        return ResponseEntity.ok(topicService.getTopicsByChapter(chapterId));
    }

    @GetMapping("/{id}/lesson-plans")
    public ResponseEntity<List<LessonPlanResponse>> getLessonPlansByTopic(@PathVariable Long id) {
        List<LessonPlanResponse> lessonPlans = lessonPlanService.getLessonPlansByTopic(id);
        if (lessonPlans.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(lessonPlans);
    }

    @PostMapping
    public ResponseEntity<TopicResponse> createTopic(@Valid @RequestBody TopicRequest request) {
        return ResponseEntity.ok(topicService.createTopic(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TopicResponse> updateTopic(@PathVariable Long id, @Valid @RequestBody TopicRequest request) {
        return ResponseEntity.ok(topicService.updateTopic(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok().build();
    }
}