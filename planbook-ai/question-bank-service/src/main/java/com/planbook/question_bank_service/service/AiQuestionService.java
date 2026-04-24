package com.planbook.question_bank_service.service;

import com.planbook.question_bank_service.dto.AnswerSuggestionDTO;
import com.planbook.question_bank_service.dto.QuestionImproveDTO;
import com.planbook.question_bank_service.dto.QuestionSuggestionDTO;
import com.planbook.question_bank_service.dto.QuestionSuggestionRequest;
import com.planbook.question_bank_service.entity.Question;
import com.planbook.question_bank_service.exception.ResourceNotFoundException;
import com.planbook.question_bank_service.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiQuestionService {
    
    private final RestTemplate restTemplate;
    private final QuestionRepository questionRepository;
    
    // Giả định ai-service chạy ở cổng 8081
    private final String AI_SERVICE_URL = "http://ai-service:8081/api";

    public AiQuestionService(RestTemplate restTemplate, QuestionRepository questionRepository) {
        this.restTemplate = restTemplate;
        this.questionRepository = questionRepository;
    }
    
    /**
     * AI sinh đề câu hỏi mới từ mô tả
     */
    public QuestionSuggestionDTO suggestQuestion(QuestionSuggestionRequest request) {
        String url = AI_SERVICE_URL + "/generate-question";
        
        // Call ai-service
        return restTemplate.postForObject(
            url,
            request,
            QuestionSuggestionDTO.class
        );
    }
    
    /**
     * AI cải thiện câu hỏi hiện tại
     */
    public QuestionImproveDTO improveQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Câu hỏi không tìm thấy với ID: " + questionId));
        
        String url = AI_SERVICE_URL + "/improve-question";
        
        // Call AI để suggest cách cải thiện
        return restTemplate.postForObject(
            url,
            question,
            QuestionImproveDTO.class
        );
    }
    
    /**
     * AI sinh giải thích chi tiết cho câu hỏi
     */
    public AnswerSuggestionDTO generateExplanation(Long questionId) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Câu hỏi không tìm thấy với ID: " + questionId));
            
        String url = AI_SERVICE_URL + "/generate-explanation";
        
        Map<String, Object> request = new HashMap<>();
        request.put("question", question.getContent());
        request.put("correctAnswer", question.getCorrectAnswer());
        request.put("options", question.getOptions());
        
        String explanation = restTemplate.postForObject(
            url,
            request,
            String.class
        );
        
        return new AnswerSuggestionDTO(explanation);
    }
}
