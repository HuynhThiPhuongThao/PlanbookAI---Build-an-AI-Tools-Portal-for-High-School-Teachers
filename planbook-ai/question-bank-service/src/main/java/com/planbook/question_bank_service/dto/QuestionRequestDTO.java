package com.planbook.question_bank_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class QuestionRequestDTO {

    @NotBlank(message = "Question content is required")
    @Size(min = 10, max = 1000, message = "Question content must be 10-1000 characters")
    private String content;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Topic is required")
    private String topic;

    private Long subjectId;
    private Long chapterId;
    private Long topicId;

    @NotNull(message = "Difficulty is required")
    private String difficultyLevel;

    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;

    @NotEmpty(message = "At least 4 options are required")
    @Size(min = 4, max = 6, message = "Options must contain 4-6 items")
    private List<String> options;

    @Size(max = 2000, message = "Explanation must be <= 2000 characters")
    private String explanation;

    public QuestionRequestDTO() {}

    public String getContent() { return content; }
    public String getSubject() { return subject; }
    public String getTopic() { return topic; }
    public Long getSubjectId() { return subjectId; }
    public Long getChapterId() { return chapterId; }
    public Long getTopicId() { return topicId; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public String getCorrectAnswer() { return correctAnswer; }
    public List<String> getOptions() { return options; }
    public String getExplanation() { return explanation; }

    public void setContent(String content) { this.content = content; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setTopic(String topic) { this.topic = topic; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public void setChapterId(Long chapterId) { this.chapterId = chapterId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public void setOptions(List<String> options) { this.options = options; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
