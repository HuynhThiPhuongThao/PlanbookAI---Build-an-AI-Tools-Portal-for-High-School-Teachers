#!/bin/bash
# =====================================================================
# seed.sh — Chạy sau khi docker compose up xong
# Script này tự động đợi auth-service sẵn sàng rồi mới seed data
#
# Usage:
#   bash planbook-ai/seed.sh        (từ thư mục D:\XDOPP)
#   hoặc: bash seed.sh              (từ thư mục planbook-ai)
# =====================================================================

echo "==================================="
echo "  PlanbookAI - Seed Data Script"
echo "==================================="

# --- Tìm đúng container tên ---
MYSQL_CONTAINER="planbook-mysql"

# --- Hàm chờ MySQL sẵn sàng ---
wait_mysql() {
  echo "[1/3] Đợi MySQL sẵn sàng..."
  for i in $(seq 1 30); do
    if docker exec $MYSQL_CONTAINER mysqladmin ping -u root -proot123 --silent 2>/dev/null; then
      echo "      MySQL ready!"
      return 0
    fi
    echo "      Waiting... ($i/30)"
    sleep 3
  done
  echo "ERROR: MySQL không khởi động được sau 90 giây!"
  exit 1
}

# --- Hàm chờ bảng users được tạo bởi Hibernate ---
wait_table() {
  echo "[2/3] Đợi bảng 'users' được tạo (Hibernate ddl-auto)..."
  for i in $(seq 1 40); do
    RESULT=$(docker exec $MYSQL_CONTAINER mysql -u root -proot123 db_auth \
      -e "SHOW TABLES LIKE 'users';" 2>/dev/null | grep -c "users")
    if [ "$RESULT" -gt "0" ]; then
      echo "      Bảng users tồn tại!"
      return 0
    fi
    echo "      Waiting for Hibernate... ($i/40)"
    sleep 3
  done
  echo "ERROR: Bảng users không được tạo sau 120 giây!"
  exit 1
}

# --- Seed users ---
seed_users() {
  echo "[3/3] Đang seed tài khoản test vào db_auth..."
  docker exec $MYSQL_CONTAINER mysql -u root -proot123 db_auth <<'SQL'
SET @p = '$2a$10$BzGYuj2C.L3eSs7RXA9fJ..vYrntVoHXxgDjRXwdCghwUJDn2qxWS';
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
SQL
  echo ""
  echo "=== Seed curriculum data ==="
  docker exec $MYSQL_CONTAINER mysql -u root -proot123 < /dev/stdin <<'SQL'
$(cat db/dataCurriculum-service.sql 2>/dev/null || echo "SELECT 'No curriculum data file';")
SQL
}

wait_mysql
wait_table
seed_users

echo ""
echo "==================================="
echo "  DONE! Tài khoản test:"
echo "  Email: staff@gmail.com"
echo "  Pass : admin@123"
echo "==================================="
