-- =====================================================================
-- PlanbookAI - SEED DATA
-- Chạy sau khi đã chạy init-databases.sql
-- Usage: mysql -u root -P 3307 -proot123 < planbook-ai/seed-data.sql
--
-- Tài khoản mặc định (tất cả dùng pass: Planbook@2026):
--   admin@planbook.ai   → ADMIN
--   teacher1@gmail.com  → TEACHER  (khoivan)
--   manager@gmail.com   → MANAGER
--   manager1@gmail.com  → MANAGER
--   manager2@gmail.com  → MANAGER
--   staff@gmail.com     → STAFF
--   staff1@gmail.com    → STAFF
-- =====================================================================

-- BCrypt hash của "Planbook@2026" (strength 10)
-- Nếu muốn đổi pass, dùng: https://bcrypt-generator.com/
SET @default_pass = '$2a$10$8K1p/a0dclxE6oMRiMbmTuJ0KL5c8X5VFkn8vEPdpJMWixqnCIxq2';

-- =====================================================================
-- 1. db_auth.users (Tài khoản đăng nhập)
-- =====================================================================
USE db_auth;

INSERT IGNORE INTO users (email, password_hash, full_name, role, is_active, created_at) VALUES
  ('admin@planbook.ai',  @default_pass, 'admin1',   'ADMIN',   true, NOW()),
  ('teacher1@gmail.com', @default_pass, 'khoivan',  'TEACHER', true, NOW()),
  ('manager@gmail.com',  @default_pass, 'manager1', 'MANAGER', true, NOW()),
  ('manager1@gmail.com', @default_pass, 'manager1', 'MANAGER', true, NOW()),
  ('manager2@gmail.com', @default_pass, 'manager2', 'MANAGER', true, NOW()),
  ('staff@gmail.com',    @default_pass, 'staff',    'STAFF',   true, NOW()),
  ('staff1@gmail.com',   @default_pass, 'staff1',   'STAFF',   true, NOW());

-- Đảm bảo admin@planbook.ai luôn là ADMIN
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@planbook.ai';

SELECT 'db_auth.users:' AS '', email, role FROM users;

-- =====================================================================
-- 2. db_user.user_profiles (Thông tin profile)
-- =====================================================================
USE db_user;

-- Lấy userId từ db_auth để dùng làm FK
INSERT IGNORE INTO user_profiles (user_id, email, full_name, role, school_name, is_active, created_at, updated_at)
SELECT
  a.id,
  a.email,
  a.full_name,
  a.role,
  CASE a.email
    WHEN 'admin@planbook.ai'  THEN 'UTH'
    WHEN 'teacher1@gmail.com' THEN 'Đại học GTVT TP.HCM'
    ELSE NULL
  END,
  true,
  NOW(),
  NOW()
FROM db_auth.users a;

SELECT 'db_user.user_profiles:' AS '', email, role, school_name FROM user_profiles;
