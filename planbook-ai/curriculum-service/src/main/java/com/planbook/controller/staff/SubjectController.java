package com.planbook.controller.staff;

import com.planbook.dto.staff.SubjectResponse;
import com.planbook.dto.staff.SubjectRequest;
import com.planbook.service.staff.SubjectService;
import com.planbook.dto.staff.ChapterResponse;
import com.planbook.service.staff.ChapterService;
import jakarta.validation.Valid;


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

    @PostMapping
    public ResponseEntity<SubjectResponse> createSubject(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(subjectService.createSubject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectResponse> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(subjectService.updateSubject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok().build();
    }
}
