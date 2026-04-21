# =====================================================================
# seed.ps1 — Chạy sau docker compose up để tạo tài khoản test
# Usage: .\seed.ps1   (từ thư mục planbook-ai)
# =====================================================================

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  PlanbookAI - Seed Data Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$CONTAINER = "planbook-mysql"
$GATEWAY   = "http://localhost:8080/api"
$TEST_PASS = "admin@123"

# [1] Chờ MySQL
Write-Host "`n[1/4] Chờ MySQL sẵn sàng..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    docker exec $CONTAINER mysqladmin ping -u root -proot123 --silent 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Host "      MySQL ready! " -ForegroundColor Green; break }
    Write-Host "      Waiting... ($i/30)"; Start-Sleep 3
}

# [2] Chờ bảng users (Hibernate tạo)
Write-Host "`n[2/4] Chờ bảng 'users' được tạo..." -ForegroundColor Yellow
for ($i = 1; $i -le 40; $i++) {
    $r = docker exec $CONTAINER mysql -u root -proot123 db_auth -e "SHOW TABLES LIKE 'users';" 2>$null
    if ($r -match "users") { Write-Host "      Bảng users tồn tại! " -ForegroundColor Green; break }
    Write-Host "      Waiting for Hibernate... ($i/40)"; Start-Sleep 3
}

# [3] Dùng Register API để lấy BCrypt hash đúng cho admin@123
Write-Host "`n[3/4] Lấy BCrypt hash qua Register API..." -ForegroundColor Yellow
$body = @{ email="__seed_temp@planbook.ai"; password=$TEST_PASS; fullName="Temp"; role="TEACHER" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$GATEWAY/auth/register" -Method POST -ContentType "application/json" -Body $body | Out-Null
    Write-Host "      Hash đã tạo thành công! " -ForegroundColor Green
} catch {
    Write-Host "      Có thể temp user đã tồn tại, tiếp tục..." -ForegroundColor Gray
}

# [4] Cập nhật tất cả user dùng hash từ temp user
Write-Host "`n[4/4] Seed tài khoản test vào DB..." -ForegroundColor Yellow
$sql = @"
SET @h = (SELECT password_hash FROM users WHERE email = '__seed_temp@planbook.ai');
INSERT IGNORE INTO users (email, password_hash, full_name, role, is_active, created_at) VALUES
  ('admin@planbook.ai',  @h, 'Admin',    'ADMIN',   true, NOW()),
  ('teacher1@gmail.com', @h, 'khoivan',  'TEACHER', true, NOW()),
  ('manager@gmail.com',  @h, 'Manager1', 'MANAGER', true, NOW()),
  ('manager1@gmail.com', @h, 'Manager1', 'MANAGER', true, NOW()),
  ('manager2@gmail.com', @h, 'Manager2', 'MANAGER', true, NOW()),
  ('staff@gmail.com',    @h, 'Staff',    'STAFF',   true, NOW()),
  ('staff1@gmail.com',   @h, 'Staff1',   'STAFF',   true, NOW());
UPDATE users SET password_hash = @h, role='ADMIN' WHERE email = 'admin@planbook.ai';
UPDATE users SET password_hash = @h WHERE email != 'admin@planbook.ai' AND email != '__seed_temp@planbook.ai';
DELETE FROM users WHERE email = '__seed_temp@planbook.ai';
SELECT email, role FROM users ORDER BY role;
"@
$sql | docker exec -i $CONTAINER mysql -u root -proot123 db_auth

Write-Host "`n===================================" -ForegroundColor Green
Write-Host "  DONE! Tất cả dùng pass: admin@123" -ForegroundColor Green
Write-Host "  admin@planbook.ai   → ADMIN" -ForegroundColor White
Write-Host "  staff@gmail.com     → STAFF" -ForegroundColor White
Write-Host "  teacher1@gmail.com  → TEACHER" -ForegroundColor White
Write-Host "  manager@gmail.com   → MANAGER" -ForegroundColor White
Write-Host "===================================" -ForegroundColor Green


Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  PlanbookAI - Seed Data Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$CONTAINER = "planbook-mysql"
$HASH = '$2a$10$BzGYuj2C.L3eSs7RXA9fJ..vYrntVoHXxgDjRXwdCghwUJDn2qxWS'

# [1] Chờ MySQL
Write-Host "`n[1/3] Chờ MySQL sẵn sàng..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    $ping = docker exec $CONTAINER mysqladmin ping -u root -proot123 --silent 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      MySQL ready! " -ForegroundColor Green
        break
    }
    Write-Host "      Waiting... ($i/30)"
    Start-Sleep 3
}

# [2] Chờ bảng users (Hibernate tạo)
Write-Host "`n[2/3] Chờ bảng 'users' được tạo..." -ForegroundColor Yellow
for ($i = 1; $i -le 40; $i++) {
    $result = docker exec $CONTAINER mysql -u root -proot123 db_auth -e "SHOW TABLES LIKE 'users';" 2>$null
    if ($result -match "users") {
        Write-Host "      Bảng users tồn tại! " -ForegroundColor Green
        break
    }
    Write-Host "      Waiting for Hibernate... ($i/40)"
    Start-Sleep 3
}

# [3] Seed users
Write-Host "`n[3/3] Seed tài khoản test..." -ForegroundColor Yellow
$sql = @"
SET @p = '$HASH';
INSERT IGNORE INTO users (email, password_hash, full_name, role, is_active, created_at) VALUES
  ('admin@planbook.ai',  @p, 'admin1',   'ADMIN',   true, NOW()),
  ('teacher1@gmail.com', @p, 'khoivan',  'TEACHER', true, NOW()),
  ('manager@gmail.com',  @p, 'manager1', 'MANAGER', true, NOW()),
  ('manager1@gmail.com', @p, 'manager1', 'MANAGER', true, NOW()),
  ('manager2@gmail.com', @p, 'manager2', 'MANAGER', true, NOW()),
  ('staff@gmail.com',    @p, 'staff',    'STAFF',   true, NOW()),
  ('staff1@gmail.com',   @p, 'staff1',   'STAFF',   true, NOW());
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@planbook.ai';
SELECT email, role FROM users;
"@

$sql | docker exec -i $CONTAINER mysql -u root -proot123 db_auth

Write-Host "`n===================================" -ForegroundColor Green
Write-Host "  DONE! Tài khoản test:" -ForegroundColor Green
Write-Host "  staff@gmail.com     / admin@123" -ForegroundColor White
Write-Host "  teacher1@gmail.com  / admin@123" -ForegroundColor White
Write-Host "  admin@planbook.ai   / admin@123" -ForegroundColor White
Write-Host "===================================" -ForegroundColor Green
