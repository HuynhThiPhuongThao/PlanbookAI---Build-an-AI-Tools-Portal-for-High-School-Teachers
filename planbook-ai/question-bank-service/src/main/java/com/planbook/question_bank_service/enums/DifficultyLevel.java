package com.planbook.question_bank_service.enums;

public enum DifficultyLevel {
    EASY("Dễ"),
    MEDIUM("Trung bình"),
    HARD("Khó");
    
    private final String description;
    
    DifficultyLevel(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}