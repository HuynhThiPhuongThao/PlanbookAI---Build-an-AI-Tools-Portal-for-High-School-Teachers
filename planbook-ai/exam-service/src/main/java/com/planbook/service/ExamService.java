package com.planbook.service;

import com.planbook.dto.CreateExamRequest;
import com.planbook.dto.ExamResponse;
import com.planbook.dto.PromptDTO;
import com.planbook.entity.Exam;
import com.planbook.repository.ExamRepository;
import com.planbook.service.AiPromptService;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final AiPromptService aiPromptService;

    public ExamService(ExamRepository examRepository, AiPromptService aiPromptService) {
        this.examRepository = examRepository;
        this.aiPromptService = aiPromptService;
    }

    public ExamResponse createExam(CreateExamRequest request, Long teacherId) {
        // 🔹 AI integration
        PromptDTO.PromptResponse prompt =
            aiPromptService.getActivePrompt("exam_generation_template");

        System.out.println("AI Prompt: " + prompt.getContent());

        Exam exam = new Exam();

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            exam.setTitle(prompt.getName());
        } else {
            exam.setTitle(request.getTitle());
        }
        
        exam.setTeacherId(teacherId); // lấy từ JWT, không dùng request.getTeacherId()
        exam.setQuestionIds(request.getQuestionIds());
        exam.setAnswerKey(request.getAnswerKey());
        exam.setCreatedAt(LocalDateTime.now());

        Exam savedExam = examRepository.save(exam);
        return mapToResponse(savedExam);
    }

    public List<ExamResponse> getExamsByTeacher(Long teacherId) {
        return examRepository.findByTeacherId(teacherId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Exam getOwnedExamOrThrow(Long examId, Long teacherId) {
        return examRepository.findByIdAndTeacherId(examId, teacherId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đề thi hoặc bạn không có quyền truy cập"
                ));
    }

    private ExamResponse mapToResponse(Exam exam) {
        ExamResponse response = new ExamResponse();
        response.setId(exam.getId());
        response.setTitle(exam.getTitle());
        response.setTeacherId(exam.getTeacherId());
        response.setQuestionIds(exam.getQuestionIds());
        response.setAnswerKey(exam.getAnswerKey());
        response.setCreatedAt(exam.getCreatedAt());
        return response;
    }
}