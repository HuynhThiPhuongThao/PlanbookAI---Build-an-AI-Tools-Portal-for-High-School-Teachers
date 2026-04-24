package com.planbook.dto.staff;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TopicRequest {
    @NotBlank(message = "Tên bài học không được để trống")
    private String title;

    @NotNull(message = "ID chương không được để trống")
    private Long chapterId;
}
