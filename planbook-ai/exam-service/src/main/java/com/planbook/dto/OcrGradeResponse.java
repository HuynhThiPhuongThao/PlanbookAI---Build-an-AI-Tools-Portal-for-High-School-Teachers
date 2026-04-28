package com.planbook.dto;

import java.util.List;

public class OcrGradeResponse {

    private Integer totalQuestions;
    private Integer correctCount;
    private List<Integer> wrongQuestionIds;
    private Double score;
    private String message;

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
    }

    public List<Integer> getWrongQuestionIds() {
        return wrongQuestionIds;
    }

    public void setWrongQuestionIds(List<Integer> wrongQuestionIds) {
        this.wrongQuestionIds = wrongQuestionIds;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
