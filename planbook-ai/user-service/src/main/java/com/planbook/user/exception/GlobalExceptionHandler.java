package com.planbook.user.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

// @RestControllerAdvice = "lắng nghe" tất cả exception từ mọi Controller
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Bắt RuntimeException (bao gồm "User not found")
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        // Tùy message để quyết định status code
        HttpStatus status = ex.getMessage() != null && ex.getMessage().contains("not found")
                ? HttpStatus.NOT_FOUND // 404
                : HttpStatus.INTERNAL_SERVER_ERROR; // 500

        return ResponseEntity.status(status).body(Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", status.value(),
                "message", ex.getMessage()));
    }

    // Bắt lỗi 403 – không đủ quyền
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(Exception ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", 403,
                "message", "Bạn không có quyền thực hiện thao tác này"));
    }
}
// Chức năng: Trung tâm xử lý khủng hoảng – bắt mọi lỗi trong app, trả về JSON đẹp thay vì HTML lỗi xấu xí.