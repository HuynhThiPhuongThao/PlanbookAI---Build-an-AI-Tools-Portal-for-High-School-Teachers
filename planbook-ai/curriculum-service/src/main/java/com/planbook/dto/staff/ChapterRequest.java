package com.planbook.dto.staff;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChapterRequest {
    @NotBlank(message = "Tên chương không được để trống")
    private String name;

    @NotNull(message = "ID môn học không được để trống")
    private Long subjectId;
}
