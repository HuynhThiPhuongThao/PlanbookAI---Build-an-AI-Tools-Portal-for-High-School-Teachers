-- =====================================================================
-- PlanbookAI - Master Seed File
-- File này được MySQL tự động chạy khi container khởi động lần đầu
-- (hoặc khi volume bị xóa: docker compose down -v)
--
-- Thứ tự chạy:
--   01-init-databases.sql  → Tạo các DB
--   02-master-seed.sql     → Tạo bảng + seed data (file này)
-- =====================================================================

-- BẮT BUỘC: Khai báo charset UTF-8 trước khi làm bất cứ thứ gì
-- Thiếu dòng này → tiếng Việt bị lỗi (hiện ???, Ã, Æ°...)
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;


-- =====================================================================
-- 1. db_auth — Tài khoản đăng nhập
-- =====================================================================
USE db_auth;

-- Bảng USERS: mỗi dòng = 1 tài khoản đăng nhập
-- Khi người dùng bấm "Đăng ký" → 1 dòng mới được thêm vào đây
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(100) UNIQUE NOT NULL   COMMENT 'Email dùng để đăng nhập',
    password_hash VARCHAR(255) NOT NULL           COMMENT 'Password hash bằng BCrypt',
    full_name     VARCHAR(255)                    COMMENT 'Tên hiển thị',
    role          VARCHAR(30)  NOT NULL DEFAULT 'TEACHER'
                                                  COMMENT 'ADMIN | MANAGER | STAFF | TEACHER',
    is_active     BOOLEAN DEFAULT TRUE            COMMENT 'True=đang hoạt động, False=bị khóa',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng REFRESH_TOKENS: lưu token đăng nhập dài hạn
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL     COMMENT 'Tài khoản sở hữu token',
    token      TEXT NOT NULL       COMMENT 'JWT refresh token string',
    expires_at TIMESTAMP NOT NULL  COMMENT 'Token hết hạn khi nào',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed tài khoản test — password: admin@123
-- BCrypt hash này tương ứng với chuỗi "admin@123"
SET @h = '$2a$10$BzGYuj2C.L3eSs7RXA9fJ..vYrntVoHXxgDjRXwdCghwUJDn2qxWS';

INSERT IGNORE INTO users (email, password_hash, full_name, role, is_active)
VALUES
  ('admin@planbook.ai',  @h, 'Admin',    'ADMIN',   1),
  ('manager@gmail.com',  @h, 'Manager1', 'MANAGER', 1),
  ('manager1@gmail.com', @h, 'Manager1', 'MANAGER', 1),
  ('manager2@gmail.com', @h, 'Manager2', 'MANAGER', 1),
  ('staff@gmail.com',    @h, 'Staff',    'STAFF',   1),
  ('staff1@gmail.com',   @h, 'Staff1',   'STAFF',   1),
  ('teacher1@gmail.com', @h, 'khoivan',  'TEACHER', 1);


-- =====================================================================
-- 2. db_user — Profile người dùng
-- =====================================================================
USE db_user;

-- Bảng USER_PROFILES: thông tin chi tiết (tên trường, môn dạy, avatar...)
-- Tách riêng với db_auth theo nguyên tắc "Database per Service" của Microservice
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id          BIGINT PRIMARY KEY      COMMENT 'ID đồng bộ với db_auth.users.id',
    email            VARCHAR(100) UNIQUE NOT NULL,
    full_name        VARCHAR(255),
    role             VARCHAR(30) NOT NULL DEFAULT 'TEACHER',
    avatar_url       VARCHAR(500)           COMMENT 'Link ảnh đại diện',
    phone_number     VARCHAR(20),
    school_name      VARCHAR(255)           COMMENT 'Tên trường đang dạy',
    subject_specialty VARCHAR(100)          COMMENT 'Môn chuyên',
    bio              TEXT                   COMMENT 'Giới thiệu bản thân',
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 3. db_curriculum — Chương trình học + Giáo án mẫu
-- =====================================================================
USE db_curriculum;

-- Bảng SUBJECTS: Môn học (Hóa học, Toán, Lý...)
CREATE TABLE IF NOT EXISTS subjects (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)  COMMENT 'Tên môn học',
    description VARCHAR(500)  COMMENT 'Mô tả ngắn'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Bảng CHAPTERS: Chương (thuộc Môn học)
CREATE TABLE IF NOT EXISTS chapters (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255),
    subject_id BIGINT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Bảng TOPICS: Bài học cụ thể (thuộc Chương)
CREATE TABLE IF NOT EXISTS topics (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255),
    chapter_id BIGINT NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Bảng CURRICULUM_TEMPLATES: Khung chương trình (Admin tạo)
CREATE TABLE IF NOT EXISTS curriculum_templates (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)   COMMENT 'Tên template',
    description TEXT           COMMENT 'Mô tả',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Bảng SAMPLE_LESSON_PLANS: Giáo án mẫu do Staff soạn
-- Khi Staff bấm "Lưu nháp" → 1 dòng mới được thêm vào đây
-- Khi Staff gửi duyệt → status chuyển PENDING_REVIEW
-- Khi Manager duyệt → status chuyển APPROVED
CREATE TABLE IF NOT EXISTS sample_lesson_plans (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
    title                  VARCHAR(255)   COMMENT 'Tiêu đề giáo án',
    content                LONGTEXT       COMMENT 'Nội dung giáo án (text do Staff soạn hoặc AI gợi ý)',
    staff_id               BIGINT         COMMENT 'ID người soạn (từ db_auth.users)',
    topic_id               BIGINT         COMMENT 'Bài học liên kết',
    curriculum_template_id BIGINT         COMMENT 'Template dùng (optional)',
    status                 VARCHAR(30) DEFAULT 'DRAFT'
                                          COMMENT 'DRAFT | PENDING_REVIEW | APPROVED | REJECTED',
    review_note            TEXT           COMMENT 'Ghi chú của Manager khi duyệt',
    reviewed_by            BIGINT         COMMENT 'ID Manager đã duyệt',
    reviewed_at            TIMESTAMP      COMMENT 'Thời điểm duyệt xong',
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (curriculum_template_id) REFERENCES curriculum_templates(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed dữ liệu môn học Hóa học THPT
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM topics;
DELETE FROM chapters;
DELETE FROM subjects;
ALTER TABLE topics    AUTO_INCREMENT = 1;
ALTER TABLE chapters  AUTO_INCREMENT = 1;
ALTER TABLE subjects  AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO subjects (id, name, description) VALUES
(1, 'Hóa học THPT', 'Dữ liệu nền môn Hóa học cấp 3');

INSERT INTO chapters (id, name, subject_id) VALUES
(1,  'Chương 1: Nguyên tử', 1),
(2,  'Chương 2: Bảng tuần hoàn và định luật tuần hoàn', 1),
(3,  'Chương 3: Liên kết hóa học', 1),
(4,  'Chương 4: Phản ứng hóa học', 1),
(5,  'Chương 5: Nhóm Halogen', 1),
(6,  'Chương 6: Oxi - Lưu huỳnh', 1),
(7,  'Chương 7: Nitơ - Photpho', 1),
(8,  'Chương 8: Cacbon - Silic', 1),
(9,  'Chương 9: Đại cương hóa hữu cơ', 1),
(10, 'Chương 10: Este - Lipit', 1),
(11, 'Chương 11: Cacbohidrat', 1),
(12, 'Chương 12: Amin - Amino axit - Protein', 1),
(13, 'Chương 13: Polime', 1),
(14, 'Chương 14: Kim loại', 1),
(15, 'Chương 15: Điện hóa học', 1);

INSERT INTO topics (id, title, chapter_id) VALUES
(1,  'Cấu tạo nguyên tử', 1),
(2,  'Cấu hình electron', 1),
(3,  'Số oxi hóa', 1),
(4,  'Bảng tuần hoàn nguyên tố', 2),
(5,  'Định luật tuần hoàn', 2),
(6,  'Sự biến đổi tính chất của nguyên tố', 2),
(7,  'Liên kết ion', 3),
(8,  'Liên kết cộng hóa trị', 3),
(9,  'Liên kết kim loại', 3),
(10, 'Phản ứng oxi hóa khử', 4),
(11, 'Cân bằng phản ứng hóa học', 4),
(12, 'Tốc độ phản ứng', 4),
(13, 'Clo', 5),
(14, 'Hidro clorua và axit HCl', 5),
(15, 'Muối clorua', 5),
(16, 'Oxi và ozon', 6),
(17, 'Lưu huỳnh', 6),
(18, 'Axit sunfuric', 6);


-- =====================================================================
-- LƯU Ý: db_ai KHÔNG được seed ở đây!
-- =====================================================================
-- ai-service dùng Alembic để tự tạo và quản lý bảng prompts.
-- Nếu file này CREATE TABLE prompts trước → Alembic crash "Table already exists".
--
-- Sau khi docker compose up xong, chạy lệnh seed prompts riêng:
--   docker cp db/seed_prompts_db_ai.sql planbook-mysql:/tmp/p.sql
--   docker exec planbook-mysql bash -c "mysql -u root -proot123 --default-character-set=utf8mb4 db_ai < /tmp/p.sql"
-- =====================================================================
