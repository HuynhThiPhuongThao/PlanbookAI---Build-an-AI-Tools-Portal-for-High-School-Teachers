package com.planbook.auth.dto;

import com.planbook.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body cho POST /api/auth/internal/create-account
 *
 * Khác RegisterRequest ở chỗ: có thêm field `role`
 * để Admin chỉ định STAFF hoặc MANAGER.
 *
 * Lý do KHÔNG dùng @RequestParam cho role:
 * → Query param có thể bị API Gateway strip/encode
 * → Đưa hết vào body: an toàn, nhất quán, dễ test hơn
 */
@Data
public class CreateAccountRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotNull(message = "Role không được để trống")
    private Role role; // STAFF hoặc MANAGER
}
