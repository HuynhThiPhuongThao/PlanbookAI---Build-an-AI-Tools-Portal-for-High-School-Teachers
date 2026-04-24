package com.planbook.question_bank_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class QuestionRequestDTO {
    
    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    @Size(min = 10, max = 1000, message = "Nội dung phải từ 10-1000 ký tự")
    private String content;
    
    @NotBlank(message = "Môn học không được để trống")
    private String subject;
    
    @NotBlank(message = "Chương không được để trống")
    private String topic;
    
    @NotNull(message = "Độ khó không được để trống")
    private String difficultyLevel;
    
    @NotBlank(message = "Đáp án đúng không được để trống")
    private String correctAnswer;
    
    @NotEmpty(message = "Phải có ít nhất 4 đáp án")
    @Size(min = 4, max = 6, message = "Số đáp án từ 4-6 lựa chọn")
    private List<String> options;
    
    @NotBlank(message = "Giải thích không được để trống")
    @Size(min = 20, max = 2000, message = "Giải thích phải từ 20-2000 ký tự")
    private String explanation;
    
    // Constructor mặc định
    public QuestionRequestDTO() {}
    
    // Constructor có tham số
    public QuestionRequestDTO(String content, String subject, String topic, String difficultyLevel,
                              String correctAnswer, List<String> options, String explanation) {
        this.content = content;
        this.subject = subject;
        this.topic = topic;
        this.difficultyLevel = difficultyLevel;
        this.correctAnswer = correctAnswer;
        this.options = options;
        this.explanation = explanation;
    }
    
    // Getters
    public String getContent() { return content; }
    public String getSubject() { return subject; }
    public String getTopic() { return topic; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public String getCorrectAnswer() { return correctAnswer; }
    public List<String> getOptions() { return options; }
    public String getExplanation() { return explanation; }
    
    // Setters
    public void setContent(String content) { this.content = content; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setTopic(String topic) { this.topic = topic; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public void setOptions(List<String> options) { this.options = options; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}