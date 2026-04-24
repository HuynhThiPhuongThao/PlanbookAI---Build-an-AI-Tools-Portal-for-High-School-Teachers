package com.planbook.question_bank_service.dto;

import java.util.List;

public class QuestionSuggestionDTO {
    private String content;
    private String subject;
    private String topic;
    private String difficultyLevel;
    private String correctAnswer;
    private List<String> options;
    private String explanation;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
