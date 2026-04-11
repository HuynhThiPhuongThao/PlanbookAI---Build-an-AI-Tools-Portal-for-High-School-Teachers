-- ========================================
-- PlanbookAI - User Service Schema
-- Database: db_user
-- ========================================

-- 1. USER_PROFILES Table - Lưu thông tin chi tiết user
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id BIGINT PRIMARY KEY COMMENT 'FK tới auth-service users.id (không physical FK)',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email (copy từ auth-service)',
    full_name VARCHAR(255) COMMENT 'Tên đầy đủ',
    role VARCHAR(30) NOT NULL DEFAULT 'TEACHER' COMMENT 'ADMIN, MANAGER, STAFF, TEACHER',
    avatar_url VARCHAR(500) COMMENT 'Link ảnh đại diện',
    phone_number VARCHAR(20) COMMENT 'Số điện thoại',
    school_name VARCHAR(255) COMMENT 'Tên trường',
    subject_specialty VARCHAR(100) COMMENT 'Môn dạy/chuyên ngành',
    bio TEXT COMMENT 'Tiểu sử/giới thiệu',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'True=active, False=bị khóa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo profile',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Lần cuối update',
    INDEX idx_email (email),
    INDEX idx_role (
        role
    ),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- LƯU Ý MICROSERVICE:
-- - user_id là PK nhưng KHÔNG có physical FK tới auth-service users.id
-- - Vì auth-service và user-service là 2 DB riêng biệt
-- - Mối quan hệ được duy trì qua application logic (API call)
-- - Nếu user bị xóa ở auth-service, cần cleanup ở user-service thông qua API event