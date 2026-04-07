package com.planbook.dto;

import java.time.LocalDateTime;

public class ResultResponse {

    private Long resultId;
    private Long submissionId;
    private String studentName;
    private Double score;
    private String wrongQuestionIds;
    private String feedback;
    private LocalDateTime gradedAt;

    public ResultResponse() {
    }

    public ResultResponse(Long resultId, Long submissionId, String studentName, Double score, String wrongQuestionIds, String feedback, LocalDateTime gradedAt) {
        this.resultId = resultId;
        this.submissionId = submissionId;
        this.studentName = studentName;
        this.score = score;
        this.wrongQuestionIds = wrongQuestionIds;
        this.feedback = feedback;
        this.gradedAt = gradedAt;
    }

    public Long getResultId() {
        return resultId;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public String getStudentName() {
        return studentName;
    }

    public Double getScore() {
        return score;
    }

    public String getWrongQuestionIds() {
        return wrongQuestionIds;
    }

    public String getFeedback() {
        return feedback;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public void setWrongQuestionIds(String wrongQuestionIds) {
        this.wrongQuestionIds = wrongQuestionIds;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }
}