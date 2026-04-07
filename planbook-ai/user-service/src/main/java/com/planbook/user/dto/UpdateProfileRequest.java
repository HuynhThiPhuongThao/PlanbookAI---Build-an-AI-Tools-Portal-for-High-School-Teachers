package com.planbook.user.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Đây là DTO nhận data từ client GỬI LÊN khi user muốn cập nhật profile của mình.

@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String avatarUrl;
    private String phoneNumber;
    private String schoolName;
    private String subjectSpecialty;
    private String bio;
}
