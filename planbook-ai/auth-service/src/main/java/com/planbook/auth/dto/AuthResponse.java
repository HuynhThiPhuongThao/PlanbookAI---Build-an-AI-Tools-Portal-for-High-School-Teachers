package com.planbook.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response trả về sau khi login/register thành công.
 * Frontend sẽ lưu accessToken vào localStorage/cookie.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;       // "Bearer"
    private long expiresIn;         // milliseconds

    // User info cơ bản (tránh phải gọi thêm user-service)
    private Long userId;
    private String email;
    private String fullName;
    private String role;
}
