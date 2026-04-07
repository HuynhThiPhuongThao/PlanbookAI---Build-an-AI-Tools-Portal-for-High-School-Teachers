package com.planbook.controller;

import com.planbook.dto.CreateExamRequest;
import com.planbook.dto.ExamResponse;
import com.planbook.dto.ResultResponse;
import com.planbook.dto.SubmissionResponse;
import com.planbook.service.ExamService;
import com.planbook.service.ResultService;
import com.planbook.service.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;
    private final SubmissionService submissionService;
    private final ResultService resultService;

    public ExamController(ExamService examService,
                          SubmissionService submissionService,
                          ResultService resultService) {
        this.examService = examService;
        this.submissionService = submissionService;
        this.resultService = resultService;
    }

    @PostMapping
    public ResponseEntity<ExamResponse> createExam(@RequestBody CreateExamRequest request) {
        return ResponseEntity.ok(examService.createExam(request));
    }

    @GetMapping
    public ResponseEntity<List<ExamResponse>> getExams(@RequestParam Long teacherId) {
        return ResponseEntity.ok(examService.getExamsByTeacher(teacherId));
    }

    @PostMapping("/{id}/submissions")
    public ResponseEntity<SubmissionResponse> submitExam(
            @PathVariable Long id,
            @RequestParam("studentName") String studentName,
            @RequestParam("image") MultipartFile image
    ) throws IOException {
        return ResponseEntity.ok(submissionService.submitExam(id, studentName, image));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<List<ResultResponse>> getResults(@PathVariable Long id) {
        return ResponseEntity.ok(resultService.getResultsByExam(id));
    }
}