-- ========================================
-- PlanbookAI - Auth Service Schema
-- Database: db_auth
-- ========================================

-- 1. USERS Table - Lưu thông tin đăng nhập
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email dùng để đăng nhập',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Password được hash bằng bcrypt',
    full_name VARCHAR(255) COMMENT 'Tên đầy đủ của user',
    role VARCHAR(30) NOT NULL DEFAULT 'TEACHER' COMMENT 'ADMIN, MANAGER, STAFF, TEACHER',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'True=active, False=bị khóa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo tài khoản',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Lần cuối update',
    INDEX idx_email (email),
    INDEX idx_role (
        role
    ),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- 2. REFRESH_TOKENS Table - Lưu JWT refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'FK tới users.id',
    token TEXT NOT NULL COMMENT 'JWT refresh token',
    expires_at TIMESTAMP NOT NULL COMMENT 'Thời gian hết hạn token',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Khi token được tạo',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_token (token (100))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- 3. Demo Data (optional - for testing)
-- Password: admin123 (bcrypted)
-- INSERT INTO users (email, password_hash, full_name, role, is_active)
-- VALUES (
--     'admin@planbook.ai',
--     '$2a$10$Zy...', -- encrypt bằng bcrypt trước
--     'Admin User',
--     'ADMIN',
--     TRUE
-- );