package com.planbook.user.dto;

import lombok.Data;

/**
 * Request body cho POST /api/users/internal/init-profile
 *
 * Được gọi nội bộ từ auth-service sau khi tạo tài khoản,
 * để đồng bộ profile sang db_user.
 *
 * KHÔNG qua Gateway, KHÔNG cần JWT — dùng Docker internal network.
 */
@Data
public class InitProfileRequest {
    private Long userId;
    private String email;
    private String fullName;
    private String role; // "STAFF", "MANAGER", "TEACHER"
}
