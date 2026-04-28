package com.planbook.question_bank_service.service;

import com.planbook.question_bank_service.dto.AnswerSuggestionDTO;
import com.planbook.question_bank_service.dto.QuestionImproveDTO;
import com.planbook.question_bank_service.dto.QuestionSuggestionDTO;
import com.planbook.question_bank_service.dto.QuestionSuggestionRequest;
import com.planbook.question_bank_service.entity.Question;
import com.planbook.question_bank_service.exception.ResourceNotFoundException;
import com.planbook.question_bank_service.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AiQuestionService {

    private final RestTemplate restTemplate;
    private final QuestionRepository questionRepository;

    @Value("${ai.service.url:http://localhost:8086/api/ai}")
    private String aiServiceUrl;

    public AiQuestionService(RestTemplate restTemplate, QuestionRepository questionRepository) {
        this.restTemplate = restTemplate;
        this.questionRepository = questionRepository;
    }

    public QuestionSuggestionDTO suggestQuestion(QuestionSuggestionRequest request) {
        String url = aiServiceUrl + "/generate-exercise";

        Map<String, Object> aiRequest = Map.of(
                "topic", request.getTopic(),
                "difficulty", request.getDifficultyLevel(),
                "numberOfQuestions", 1,
                "grade", "10"
        );

        Map<String, Object> aiResponse = restTemplate.postForObject(url, aiRequest, Map.class);
        if (aiResponse == null || !(aiResponse.get("questions") instanceof List<?> questions) || questions.isEmpty()) {
            throw new IllegalStateException("AI service did not return any question");
        }

        Object first = questions.get(0);
        if (!(first instanceof Map<?, ?> question)) {
            throw new IllegalStateException("AI response format is invalid");
        }

        QuestionSuggestionDTO dto = new QuestionSuggestionDTO();
        dto.setContent(stringValue(question.get("question")));
        dto.setTopic(request.getTopic());
        dto.setDifficultyLevel(request.getDifficultyLevel());
        dto.setCorrectAnswer(stringValue(question.get("correctAnswer")));
        dto.setOptions((List<String>) question.get("options"));
        dto.setExplanation(stringValue(question.get("explanation")));
        return dto;
    }

    public QuestionImproveDTO improveQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + questionId));

        QuestionImproveDTO dto = new QuestionImproveDTO();
        dto.setOriginalContent(question.getContent());
        dto.setImprovedContent(question.getContent());
        dto.setImprovementReason("Manual review required. AI improve endpoint is not configured.");
        return dto;
    }

    public AnswerSuggestionDTO generateExplanation(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + questionId));

        String explanation = question.getExplanation();
        if (explanation == null || explanation.isBlank()) {
            explanation = "No explanation available yet.";
        }
        return new AnswerSuggestionDTO(explanation);
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
