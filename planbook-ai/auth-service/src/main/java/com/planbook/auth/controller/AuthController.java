package com.planbook.auth.controller;

import com.planbook.auth.dto.AuthResponse;
import com.planbook.auth.dto.LoginRequest;
import com.planbook.auth.dto.RegisterRequest;
import com.planbook.auth.entity.User;
import com.planbook.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController - REST endpoints cho auth-service.
 *
 * Base path: /api/auth
 * Tất cả endpoint này đều PUBLIC (không cần token)
 * trừ /logout (cần token để biết logout ai).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Đăng ký, đăng nhập, refresh token")
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Đăng ký tài khoản mới (mặc định role TEACHER)
     */
    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản giáo viên mới")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * POST /api/auth/login
     * Trả về JWT access token + refresh token
     */
    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Trả về JWT access token và refresh token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * POST /api/auth/refresh
     * Dùng refresh token để lấy access token mới (không cần đăng nhập lại)
     *
     * Body: { "refreshToken": "uuid-string" }
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Lấy access token mới từ refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    /**
     * POST /api/auth/logout
     * Xóa refresh token – yêu cầu JWT trong header
     */
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Vô hiệu hóa refresh token")
    public ResponseEntity<Map<String, String>> logout(@AuthenticationPrincipal User user) {
        authService.logout(user.getId());
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    /**
     * GET /api/auth/me
     * Lấy thông tin user hiện tại từ JWT
     */
    @GetMapping("/me")
    @Operation(summary = "Thông tin user hiện tại")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole().name()
        ));
    }
}
