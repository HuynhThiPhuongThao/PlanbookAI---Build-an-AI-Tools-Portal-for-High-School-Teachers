package com.planbook.dto;

public class CreateExamRequest {

    private String title;
    private Long teacherId;
    private String questionIds;
    private String answerKey;

    public CreateExamRequest() {
    }

    public String getTitle() {
        return title;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public String getQuestionIds() {
        return questionIds;
    }

    public String getAnswerKey() {
        return answerKey;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public void setQuestionIds(String questionIds) {
        this.questionIds = questionIds;
    }

    public void setAnswerKey(String answerKey) {
        this.answerKey = answerKey;
    }
}