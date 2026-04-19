package com.planbook.question_bank_service.enums;

public enum QuestionStatus {
    PENDING("Chờ duyệt"),
    APPROVED("Đã duyệt"),
    REJECTED("Bị từ chối");
    
    private final String description;
    
    QuestionStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}