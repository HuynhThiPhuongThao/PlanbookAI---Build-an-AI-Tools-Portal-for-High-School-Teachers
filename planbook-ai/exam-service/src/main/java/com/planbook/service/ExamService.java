package com.planbook.service;

import com.planbook.dto.CreateExamRequest;
import com.planbook.dto.ExamResponse;
import com.planbook.dto.PromptDTO;
import com.planbook.dto.QuestionDTO;
import com.planbook.entity.Exam;
import com.planbook.repository.ExamRepository;
import com.planbook.service.AiPromptService;
import com.planbook.service.QuestionClient;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final AiPromptService aiPromptService;
    private final QuestionClient questionClient;

    public ExamService(ExamRepository examRepository, AiPromptService aiPromptService, QuestionClient questionClient) {
        this.examRepository = examRepository;
        this.aiPromptService = aiPromptService;
        this.questionClient = questionClient;
    }

    public ExamResponse createExam(CreateExamRequest request, Long teacherId) {
        //AI integration
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
        
// Lấy câu hỏi từ question bank
    List<QuestionDTO> questions =
        questionClient.getQuestions(request.getTopicId(), request.getLevel());

// Shuffle
    Collections.shuffle(questions);

// Lấy N câu
    List<QuestionDTO> selected = questions.stream()
        .limit(request.getNumQuestions())
        .toList();

//Convert sang String
    String questionIds = selected.stream()
        .map(q -> q.getId().toString())
        .collect(Collectors.joining(","));

    String answerKey = selected.stream()
        .map(q -> q.getId() + ":" + q.getCorrectAnswer())
        .collect(Collectors.joining(","));

//Set vào exam
        exam.setQuestionIds(questionIds);
        exam.setAnswerKey(answerKey);
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