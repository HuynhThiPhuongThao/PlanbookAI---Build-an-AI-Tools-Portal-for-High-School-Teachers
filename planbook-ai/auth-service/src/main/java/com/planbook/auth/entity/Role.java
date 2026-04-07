package com.planbook.auth.entity;

/**
 * Enum Role cho toàn bộ hệ thống PlanbookAI.
 * Định nghĩa ở auth-service vì JWT claims cần embed role.
 * Các service khác sẽ đọc role từ JWT – không cần DB riêng.
 */
public enum Role {
    ADMIN,
    MANAGER,
    STAFF,
    TEACHER
}
