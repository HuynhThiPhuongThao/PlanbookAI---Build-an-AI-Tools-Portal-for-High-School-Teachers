package com.planbook.controller.staff;

import com.planbook.dto.staff.ChapterResponse;
import com.planbook.dto.staff.TopicResponse;
import com.planbook.service.staff.ChapterService;
import com.planbook.service.staff.TopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chapters")
public class ChapterController {
    private final ChapterService chapterService;
    private final TopicService topicService;

    public ChapterController(ChapterService chapterService, TopicService topicService) {
        this.chapterService = chapterService;
        this.topicService = topicService;
    }

    @GetMapping
    public ResponseEntity<List<ChapterResponse>> getAllChapters() {
        return ResponseEntity.ok(chapterService.getAllChapters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChapterResponse> getChapterById(@PathVariable Long id) {
        return ResponseEntity.ok(chapterService.getChapterById(id));
    }

    @GetMapping("/by-subject")
    public ResponseEntity<List<ChapterResponse>> getChaptersBySubject(@RequestParam Long subjectId) {
        return ResponseEntity.ok(chapterService.getChaptersBySubject(subjectId));
    }

    @GetMapping("/{id}/topics")
    public ResponseEntity<List<TopicResponse>> getTopicsByChapter(@PathVariable Long id) {
        List<TopicResponse> topics = topicService.getTopicsByChapter(id);
        if (topics.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(topics);
}
}