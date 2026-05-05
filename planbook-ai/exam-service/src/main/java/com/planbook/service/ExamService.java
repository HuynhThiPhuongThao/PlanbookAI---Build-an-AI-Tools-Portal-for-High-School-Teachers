package com.planbook.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.planbook.dto.CreateExamRequest;
import com.planbook.dto.ExamResponse;
import com.planbook.dto.PromptDTO;
import com.planbook.dto.QuestionDTO;
import com.planbook.dto.UpdateExamRequest;
import com.planbook.entity.Exam;
import com.planbook.repository.ExamRepository;
import com.planbook.repository.ResultRepository;
import com.planbook.repository.SubmissionRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final ResultRepository resultRepository;
    private final SubmissionRepository submissionRepository;
    private final AiPromptService aiPromptService;
    private final QuestionClient questionClient;
    private final ObjectMapper objectMapper;

    public ExamService(ExamRepository examRepository,
                       ResultRepository resultRepository,
                       SubmissionRepository submissionRepository,
                       AiPromptService aiPromptService,
                       QuestionClient questionClient,
                       ObjectMapper objectMapper) {
        this.examRepository = examRepository;
        this.resultRepository = resultRepository;
        this.submissionRepository = submissionRepository;
        this.aiPromptService = aiPromptService;
        this.questionClient = questionClient;
        this.objectMapper = objectMapper;
    }

    public ExamResponse createExam(CreateExamRequest request, Long teacherId) {
        PromptDTO.PromptResponse prompt = aiPromptService.getActivePrompt("exam_generation_template");

        Exam exam = new Exam();
        String fallbackTitle = "De thi trac nghiem";
        String titleFromPrompt = (prompt != null && prompt.getName() != null && !prompt.getName().isBlank())
                ? prompt.getName()
                : fallbackTitle;
        exam.setTitle(request.getTitle() == null || request.getTitle().isBlank()
                ? titleFromPrompt
                : request.getTitle());
        exam.setTeacherId(teacherId);

        List<QuestionDTO> questions = questionClient.getQuestions(request.getTopicId(), request.getLevel())
                .stream()
                .filter(this::isUsableMultipleChoiceQuestion)
                .collect(Collectors.toList());
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy câu hỏi đã duyệt phù hợp để tạo đề");
        }

        Collections.shuffle(questions);
        int requestedQuestionCount = request.getNumQuestions() == null
                ? Math.min(questions.size(), 10)
                : request.getNumQuestions();

        if (questions.size() < requestedQuestionCount
                && request.getLevel() != null
                && !request.getLevel().isBlank()) {
            questions = questionClient.getQuestions(request.getTopicId(), null)
                    .stream()
                    .filter(this::isUsableMultipleChoiceQuestion)
                    .collect(Collectors.toList());
        }

        if (questions.size() < requestedQuestionCount) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ có " + questions.size()
                            + " câu hỏi đã duyệt phù hợp, chưa đủ để tạo đề "
                            + requestedQuestionCount + " câu. Hãy duyệt/thêm câu hỏi trong ngân hàng câu hỏi."
            );
        }

        List<QuestionDTO> selected = questions.stream()
                .limit(Math.max(1, requestedQuestionCount))
                .toList();

        String questionIds = selected.stream()
                .map(q -> q.getId().toString())
                .collect(Collectors.joining(","));

        String answerKey = selected.stream()
                .map(this::toAnswerLetter)
                .collect(Collectors.joining(","));

        exam.setQuestionIds(questionIds);
        exam.setAnswerKey(answerKey);
        exam.setQuestionsJson(serializeQuestions(selected));
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

    public ExamResponse updateExam(Long examId, UpdateExamRequest request, Long teacherId) {
        Exam exam = examRepository.findByIdAndTeacherId(examId, teacherId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Khong tim thay de thi hoac ban khong co quyen cap nhat"
                ));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            exam.setTitle(request.getTitle().trim());
        }

        if (request.getQuestions() != null) {
            List<QuestionDTO> questions = request.getQuestions()
                    .stream()
                    .filter(this::isUsableMultipleChoiceQuestion)
                    .toList();
            if (questions.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "De thi can co it nhat mot cau hoi hop le");
            }
            exam.setQuestionIds(questions.stream()
                    .map(question -> question.getId() == null ? "0" : question.getId().toString())
                    .collect(Collectors.joining(",")));
            exam.setAnswerKey(questions.stream()
                    .map(this::toAnswerLetter)
                    .collect(Collectors.joining(",")));
            exam.setQuestionsJson(serializeQuestions(questions));
        }

        return mapToResponse(examRepository.save(exam));
    }

    public Exam getOwnedExamOrThrow(Long examId, Long teacherId) {
        return examRepository.findByIdAndTeacherId(examId, teacherId)
                .orElseThrow(() -> new RuntimeException(
                        "Khong tim thay de thi hoac ban khong co quyen truy cap"
                ));
    }

    @Transactional
    public void deleteExam(Long examId, Long teacherId) {
        Exam exam = examRepository.findByIdAndTeacherId(examId, teacherId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Khong tim thay de thi hoac ban khong co quyen xoa"
                ));
        resultRepository.deleteByExamId(exam.getId());
        submissionRepository.deleteByExamId(exam.getId());
        examRepository.delete(exam);
    }

    private ExamResponse mapToResponse(Exam exam) {
        ExamResponse response = new ExamResponse();
        response.setId(exam.getId());
        response.setTitle(exam.getTitle());
        response.setTeacherId(exam.getTeacherId());
        response.setQuestionIds(exam.getQuestionIds());
        response.setAnswerKey(exam.getAnswerKey());
        List<QuestionDTO> questions = deserializeQuestions(exam.getQuestionsJson());
        response.setQuestions(questions);
        response.setQuestionCount(questions.size());
        response.setCreatedAt(exam.getCreatedAt());
        return response;
    }

    private boolean isUsableMultipleChoiceQuestion(QuestionDTO question) {
        return question != null
                && question.getContent() != null
                && question.getOptions() != null
                && question.getOptions().size() >= 2
                && question.getCorrectAnswer() != null
                && !question.getCorrectAnswer().isBlank()
                && findOptionIndex(question) >= 0;
    }

    private String toAnswerLetter(QuestionDTO question) {
        int optionIndex = findOptionIndex(question);
        if (optionIndex < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cau hoi " + question.getId() + " khong co dap an dung hop le"
            );
        }
        return String.valueOf((char) ('A' + optionIndex));
    }

    private int findOptionIndex(QuestionDTO question) {
        if (question == null || question.getOptions() == null || question.getCorrectAnswer() == null) {
            return -1;
        }

        String normalizedCorrect = question.getCorrectAnswer().trim();
        String upper = normalizedCorrect.toUpperCase(Locale.ROOT);
        if (upper.length() == 1 && upper.charAt(0) >= 'A' && upper.charAt(0) <= 'D') {
            int letterIndex = upper.charAt(0) - 'A';
            if (letterIndex < question.getOptions().size()) {
                return letterIndex;
            }
        }

        String strippedCorrect = stripAnswerPrefix(normalizedCorrect);
        for (int i = 0; i < question.getOptions().size(); i++) {
            String option = question.getOptions().get(i);
            if (option != null && (option.trim().equalsIgnoreCase(normalizedCorrect)
                    || stripAnswerPrefix(option).equalsIgnoreCase(strippedCorrect))) {
                return i;
            }
        }
        return -1;
    }

    private String stripAnswerPrefix(String value) {
        return value == null ? "" : value.replaceFirst("^\\s*[A-Da-d1-4][.)]\\s*", "").trim();
    }

    private String serializeQuestions(List<QuestionDTO> questions) {
        try {
            return objectMapper.writeValueAsString(questions);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the luu du lieu cau hoi");
        }
    }

    private List<QuestionDTO> deserializeQuestions(String questionsJson) {
        if (questionsJson == null || questionsJson.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(questionsJson, new TypeReference<List<QuestionDTO>>() {});
        } catch (Exception ex) {
            return List.of();
        }
    }
}
