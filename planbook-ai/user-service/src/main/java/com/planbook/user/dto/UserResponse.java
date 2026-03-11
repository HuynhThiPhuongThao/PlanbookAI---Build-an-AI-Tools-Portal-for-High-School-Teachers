package com.planbook.user.dto;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
// DTO này = "hộp" chứa data TRẢ VỀ cho client
// Chỉ có những field client CẦN, không thừa không thiếu
// Lưu ý: DTO này chỉ có @Getter, không có @Setter – vì client chỉ được đọc response, không được tự set giá trị vào.

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;
    private String phoneNumber;
    private String schoolName;
    private String subjectSpecialty;
    private String bio;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
