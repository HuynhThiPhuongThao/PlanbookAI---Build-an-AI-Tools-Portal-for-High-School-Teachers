package com.planbook.question_bank_service.dto;

public class AnswerSuggestionDTO {
    private String explanation;
    
    public AnswerSuggestionDTO() {}
    
    public AnswerSuggestionDTO(String explanation) {
        this.explanation = explanation;
    }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
