package com.planbook.question_bank_service.dto;

public class QuestionImproveDTO {
    private String originalContent;
    private String improvedContent;
    private String improvementReason;

    public String getOriginalContent() { return originalContent; }
    public void setOriginalContent(String originalContent) { this.originalContent = originalContent; }
    public String getImprovedContent() { return improvedContent; }
    public void setImprovedContent(String improvedContent) { this.improvedContent = improvedContent; }
    public String getImprovementReason() { return improvementReason; }
    public void setImprovementReason(String improvementReason) { this.improvementReason = improvementReason; }
}
