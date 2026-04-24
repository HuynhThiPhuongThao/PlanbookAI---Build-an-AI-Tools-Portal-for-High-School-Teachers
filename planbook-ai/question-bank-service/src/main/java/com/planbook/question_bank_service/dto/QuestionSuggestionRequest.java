package com.planbook.question_bank_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class QuestionSuggestionRequest {

    @NotBlank(message = "Chủ đề không được để trống")
    private String topic;  // VD: "Hóa học - Phản ứng hóa học"

    @NotNull(message = "Độ khó không được để trống")
    private String difficultyLevel;  // EASY, MEDIUM, HARD

    @NotBlank(message = "Mô tả không được để trống")
    @Size(min = 20, max = 500, message = "Mô tả phải từ 20-500 ký tự")
    private String description;  // VD: "Tạo câu hỏi về phản ứng oxi hóa khử"

    @Min(value = 4, message = "Phải có ít nhất 4 đáp án")
    @Max(value = 6, message = "Tối đa 6 đáp án")
    private int numberOfOptions = 4;

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getNumberOfOptions() {
        return numberOfOptions;
    }

    public void setNumberOfOptions(int numberOfOptions) {
        this.numberOfOptions = numberOfOptions;
    }
}
