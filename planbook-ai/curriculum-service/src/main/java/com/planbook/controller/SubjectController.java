package com.planbook.controller;

import com.planbook.dto.SubjectResponse;
import com.planbook.service.SubjectService;
import com.planbook.dto.ChapterResponse;
import com.planbook.service.ChapterService;


import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;


@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectService subjectService;
    private final ChapterService chapterService;

    public SubjectController(SubjectService subjectService, ChapterService chapterService) {
        this.subjectService = subjectService;
        this.chapterService = chapterService;
    }

    @GetMapping
    public ResponseEntity<List<SubjectResponse>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/{id}/chapters")
    public ResponseEntity<List<ChapterResponse>> getChaptersBySubject(@PathVariable Long id) {
        List<ChapterResponse> chapters = chapterService.getChaptersBySubject(id);
        if (chapters.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(chapters);
    }
}
