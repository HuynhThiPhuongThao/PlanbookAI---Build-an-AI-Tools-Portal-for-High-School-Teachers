package com.planbook.dto;

public class CreateExamRequest {

    private String title;
    private String questionIds;
    private String answerKey;

    public CreateExamRequest() {
    }

    public String getTitle() {
        return title;
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

    public void setQuestionIds(String questionIds) {
        this.questionIds = questionIds;
    }

    public void setAnswerKey(String answerKey) {
        this.answerKey = answerKey;
    }
}