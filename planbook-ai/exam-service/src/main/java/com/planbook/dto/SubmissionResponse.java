package com.planbook.dto;

import java.time.LocalDateTime;

public class SubmissionResponse {

    private Long submissionId;
    private String studentName;
    private String status;
    private Double score;
    private String feedback;
    private LocalDateTime submittedAt;

    public SubmissionResponse() {
    }

    public SubmissionResponse(Long submissionId, String studentName, String status, Double score, String feedback, LocalDateTime submittedAt) {
        this.submissionId = submissionId;
        this.studentName = studentName;
        this.status = status;
        this.score = score;
        this.feedback = feedback;
        this.submittedAt = submittedAt;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStatus() {
        return status;
    }

    public Double getScore() {
        return score;
    }

    public String getFeedback() {
        return feedback;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}