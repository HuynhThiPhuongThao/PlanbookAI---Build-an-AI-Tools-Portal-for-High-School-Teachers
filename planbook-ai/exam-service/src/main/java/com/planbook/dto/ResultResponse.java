package com.planbook.dto;

import java.time.LocalDateTime;

public class ResultResponse {

    private Long resultId;
    private Long submissionId;
    private String examTitle;
    private String studentName;
    private Double score;
    private Integer totalQuestions;
    private Integer correctCount;
    private String wrongQuestionIds;
    private String feedback;
    private LocalDateTime gradedAt;

    public ResultResponse() {
    }

    public Long getResultId() {
        return resultId;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public String getStudentName() {
        return studentName;
    }

    public Double getScore() {
        return score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public Integer getCorrectCount() {
        return correctCount;
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

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
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
