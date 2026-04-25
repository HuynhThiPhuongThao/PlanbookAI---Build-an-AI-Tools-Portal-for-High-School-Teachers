package com.planbook.dto;

public class CreateExamRequest {

    private String title;
    private Long topicId;
    private String level;
    private Integer numQuestions;
    private Integer numVersions; // optional

    public CreateExamRequest() {
    }

    public String getTitle() {
        return title;
    }

    public Long getTopicId() {
        return topicId;
    }

    public String getLevel() {
        return level;
    }

    public Integer getNumQuestions() {
        return numQuestions;
    }

    public Integer getNumVersions() {
        return numVersions;
    }


    public void setTitle(String title) {
        this.title = title;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setNumQuestions(Integer numQuestions) {
        this.numQuestions = numQuestions;
    }

    public void setNumVersions(Integer numVersions) {
        this.numVersions = numVersions;
    }

}