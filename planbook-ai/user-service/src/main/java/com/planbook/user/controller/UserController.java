package com.planbook.user.controller;

import com.planbook.user.dto.UpdateProfileRequest;
import com.planbook.user.dto.UserResponse;
import com.planbook.user.dto.InitProfileRequest;
import com.planbook.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

// @RestController = @Controller + tự convert return value thành JSON
// @RequestMapping = tất cả endpoint trong class đều bắt đầu bằng /api/users
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/me → user xem profile của chính mình
    // @RequestAttribute("userId") → lấy userId đã được JwtAuthFilter set vào request
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("email") String email,
            @RequestAttribute("fullName") String fullName,
            @RequestAttribute("role") String role) {
        return ResponseEntity.ok(userService.getProfile(userId, email, fullName, role));
    }

    // PUT /api/users/me → user tự cập nhật profile
    // @RequestBody → Spring đọc JSON từ request body, đổ vào UpdateProfileRequest
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("email") String email,
            @RequestAttribute("fullName") String fullName,
            @RequestAttribute("role") String role,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userId, request, email, fullName, role));
    }

    // PUT /api/users/me/fcm-token → Lấy và lưu FCM Token từ Frontend
    @PutMapping("/me/fcm-token")
    public ResponseEntity<String> updateFcmToken(
            @RequestAttribute("userId") Long userId,
            @RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        if (token != null && !token.trim().isEmpty()) {
            userService.updateFcmToken(userId, token);
            return ResponseEntity.ok("FCM Token updated successfully");
        }
        return ResponseEntity.badRequest().body("Token is required");
    }

    // GET /api/users/internal/{userId}/fcm-token → Curriculum Service gọi lấy Token
    @GetMapping("/internal/{userId}/fcm-token")
    public ResponseEntity<String> getFcmTokenInternal(@PathVariable Long userId) {
        String token = userService.getFcmToken(userId);
        return token != null ? ResponseEntity.ok(token) : ResponseEntity.notFound().build();
    }

    // GET /api/users → Admin lấy danh sách tất cả user
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllProfiles());
    }

    // GET /api/users/{userId} → Admin xem profile của bất kỳ user nào
    // @PathVariable → lấy userId từ URL path
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        // Gọi bằng tham số mặc định null vì Admin không có email/fullname của user lúc gọi API này
        return ResponseEntity.ok(userService.getProfile(userId, null, null, null));
    }

    // PUT /api/users/{userId}/deactivate → Admin khóa tài khoản
    @PutMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deactivateUser(@PathVariable Long userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.ok("Đã khóa tài khoản " + userId);
    }

    // PUT /api/users/{userId}/activate → Admin mở lại tài khoản
    @PutMapping("/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> activateUser(@PathVariable Long userId) {
        userService.activateUser(userId);
        return ResponseEntity.ok("Đã mở tài khoản " + userId);
    }

    // POST /api/users/internal/init-profile
    // Được gọi từ auth-service (qua Docker internal network, KHÔNG qua Gateway)
    // sau khi Admin tạo tài khoản để đồng bộ profile vào db_user
    // Không cần JWT vì chỉ có services trong cùng Docker network mới gọi được
    @PostMapping("/internal/init-profile")
    public ResponseEntity<String> initProfile(@RequestBody InitProfileRequest request) {
        userService.initProfile(request);
        return ResponseEntity.ok("Profile initialized for userId=" + request.getUserId());
    }
}