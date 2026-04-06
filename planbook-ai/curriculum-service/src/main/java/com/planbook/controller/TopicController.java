package com.planbook.controller;

import com.planbook.dto.TopicResponse;
import com.planbook.dto.LessonPlanResponse;
import com.planbook.service.TopicService;
import com.planbook.service.LessonPlanService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}