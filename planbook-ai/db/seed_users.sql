-- Seed users vào db_auth
-- BCrypt hash của "admin@123" (pre-generated)
USE db_auth;

SET @h = '$2a$10$BzGYuj2C.L3eSs7RXA9fJ..vYrntVoHXxgDjRXwdCghwUJDn2qxWS';

INSERT IGNORE INTO users (email, password_hash, full_name, role, is_active, created_at)
VALUES
  ('admin@planbook.ai',  @h, 'Admin',    'ADMIN',   1, NOW()),
  ('teacher1@gmail.com', @h, 'khoivan',  'TEACHER', 1, NOW()),
  ('manager@gmail.com',  @h, 'Manager1', 'MANAGER', 1, NOW()),
  ('manager1@gmail.com', @h, 'Manager1', 'MANAGER', 1, NOW()),
  ('manager2@gmail.com', @h, 'Manager2', 'MANAGER', 1, NOW()),
  ('staff@gmail.com',    @h, 'Staff',    'STAFF',   1, NOW()),
  ('staff1@gmail.com',   @h, 'Staff1',   'STAFF',   1, NOW());

UPDATE users SET role = 'ADMIN' WHERE email = 'admin@planbook.ai';

SELECT email, role FROM users ORDER BY role;
