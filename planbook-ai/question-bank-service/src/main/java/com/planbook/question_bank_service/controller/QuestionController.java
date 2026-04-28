package com.planbook.question_bank_service.controller;

import com.planbook.question_bank_service.dto.AnswerSuggestionDTO;
import com.planbook.question_bank_service.dto.ApiResponse;
import com.planbook.question_bank_service.dto.PaginatedResponse;
import com.planbook.question_bank_service.dto.QuestionImproveDTO;
import com.planbook.question_bank_service.dto.QuestionRequestDTO;
import com.planbook.question_bank_service.dto.QuestionResponseDTO;
import com.planbook.question_bank_service.dto.QuestionSuggestionDTO;
import com.planbook.question_bank_service.dto.QuestionSuggestionRequest;
import com.planbook.question_bank_service.service.AiQuestionService;
import com.planbook.question_bank_service.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Questions", description = "Question bank APIs")
@RestController
@RequestMapping("/questions")
public class QuestionController {

    private final QuestionService questionService;
    private final AiQuestionService aiQuestionService;

    public QuestionController(QuestionService questionService, AiQuestionService aiQuestionService) {
        this.questionService = questionService;
        this.aiQuestionService = aiQuestionService;
    }

    @Operation(summary = "Get question list")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<QuestionResponseDTO>>> getAllQuestions(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) String difficultyLevel,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy
    ) {
        PaginatedResponse<QuestionResponseDTO> response = questionService.getAllQuestions(
                subject, topic, subjectId, chapterId, topicId, difficultyLevel, status, keyword, page, size, sortBy
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Questions loaded"));
    }

    @Operation(summary = "Get pending questions for manager")
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PaginatedResponse<QuestionResponseDTO>>> getPendingQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PaginatedResponse<QuestionResponseDTO> response = questionService.getPendingQuestionsForManager(page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Pending questions loaded"));
    }

    @Operation(summary = "Get question details")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> getQuestionById(@PathVariable Long id) {
        QuestionResponseDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.success(question, "Question loaded"));
    }

    @Operation(summary = "Create question")
    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> createQuestion(
            @Valid @RequestBody QuestionRequestDTO request
    ) {
        QuestionResponseDTO createdQuestion = questionService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdQuestion, "Question created"));
    }

    @Operation(summary = "Update question")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequestDTO request
    ) {
        QuestionResponseDTO updatedQuestion = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedQuestion, "Question updated"));
    }

    @Operation(summary = "Delete question")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Question deleted"));
    }

    @Operation(summary = "Approve or reject question")
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> approveQuestion(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String reviewNote,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        Boolean approvedFromBody = readApproved(body);
        boolean approved = approvedFromBody != null
                ? approvedFromBody
                : "APPROVED".equalsIgnoreCase(status) || "true".equalsIgnoreCase(status);

        String rejectionReason = readString(body, "rejectionReason");
        if (rejectionReason == null) {
            rejectionReason = readString(body, "reviewNote");
        }
        if (rejectionReason == null) {
            rejectionReason = reviewNote;
        }

        QuestionResponseDTO approvedQuestion = questionService.approveQuestion(id, approved, rejectionReason);
        return ResponseEntity.ok(ApiResponse.success(
                approvedQuestion,
                approved ? "Question approved" : "Question rejected"
        ));
    }

    @Operation(summary = "AI suggest question")
    @PostMapping("/ai/suggest")
    public ResponseEntity<ApiResponse<QuestionSuggestionDTO>> suggestQuestion(
            @Valid @RequestBody QuestionSuggestionRequest request
    ) {
        QuestionSuggestionDTO suggestion = aiQuestionService.suggestQuestion(request);
        return ResponseEntity.ok(ApiResponse.success(suggestion, "AI suggestion generated"));
    }

    @Operation(summary = "AI improve question")
    @PostMapping("/ai/improve/{id}")
    public ResponseEntity<ApiResponse<QuestionImproveDTO>> improveQuestion(@PathVariable Long id) {
        QuestionImproveDTO improvement = aiQuestionService.improveQuestion(id);
        return ResponseEntity.ok(ApiResponse.success(improvement, "AI improvement generated"));
    }

    @Operation(summary = "AI generate answer explanation")
    @PostMapping("/ai/generate-answer/{id}")
    public ResponseEntity<ApiResponse<AnswerSuggestionDTO>> generateAnswerExplanation(@PathVariable Long id) {
        AnswerSuggestionDTO answer = aiQuestionService.generateExplanation(id);
        return ResponseEntity.ok(ApiResponse.success(answer, "AI answer explanation generated"));
    }

    private Boolean readApproved(Map<String, Object> body) {
        if (body == null || !body.containsKey("approved")) {
            return null;
        }
        Object value = body.get("approved");
        if (value instanceof Boolean b) {
            return b;
        }
        if (value instanceof String s) {
            return "true".equalsIgnoreCase(s) || "approved".equalsIgnoreCase(s);
        }
        return null;
    }

    private String readString(Map<String, Object> body, String key) {
        if (body == null) {
            return null;
        }
        Object value = body.get(key);
        return value == null ? null : String.valueOf(value);
    }
}
