# 📚 DATABASE FUNDAMENTALS — NHỮNG ĐIỀU CẦN HIỂU

> Ghi chú từ buổi học về Database, Microservice, Schema, Migration cho PlanBook-AI

---

## 🎯 TÓMLẠI NHANH

| Vấn đề | Giải pháp | Lưu ý |
|---|---|---|
| **DB structure (Schema)** | Mỗi service = DB riêng | Không query chéo, giao tiếp qua API |
| **Test DB vs Dev/Prod** | Test = tạm, Dev/Prod = persistent | Test DB xóa sau test, Dev/Prod lưu mãi |
| **Migration chạy mấy lần** | 1 lần/DB, tracked bởi Flyway | Skip lần tiếp theo, chỉ run new migrations |
| **Schema vs Data** | Schema = cấu trúc, Data = giá trị | Schema định nghĩa "tủ", Data là "giấy tờ" |
| **Làm sao nhớ dữ liệu** | Lưu vào ổ cứng (persistent storage) | RAM xóa khi shutdown, HDD/SSD vĩnh viễn |

---

## 1️⃣ MICROSERVICE = MỖI SERVICE DB RIÊNG

### ❌ Sai (1 DB chung):

```
1 công ty, 1 kho hồ sơ
├── Tài khoản + Profile + Câu hỏi + Bài thi → MỖI THỨ LẫN LỘN
├── Nếu Exam Service lỗi → toàn bộ DB bị ảnh hưởng
└── Scale được? Không (bottleneck tại DB)
```

### ✅ Đúng (Mỗi service DB riêng):

```
PlanBook-AI = 1 công ty lớn
├── TỦ AUTH (db_auth)
│   └── Hộc: id, email, password_hash, role, is_active, created_at
│   └── Data: admin@planbook.ai, teacher1@gmail.com, ...
│
├── TỦ USER (db_user)
│   └── Hộc: user_id, avatar, phone, school, is_active
│   └── Data: user1 có phone=0909xxx, school="UTH"
│
├── TỦ EXAM (db_exam)
│   └── Hộc: id, name, total_questions, duration, created_by
│   └── Data: "Chemistry Quiz", 20 questions, 60 mins
│
└── TỦ QUESTION (db_question)
    └── Hộc: id, content, answer, difficulty, subject
    └── Data: "H2O là gì?", answer="Nước", difficulty="Easy"
```

**Lợi:**
- ✅ Auth DB crash → User service vẫn chạy (Isolation)
- ✅ Scale riêng: Exam traffic cao → upgrade exam DB thôi
- ✅ Team riêng quản lý schema của mình
- ✅ Microservice principle: Decoupled data

**Nhớ:** Các service giao tiếp qua **API (REST)**, không query chéo DB!

---

## 2️⃣ VÍ DỤ ĐỜI SỐNG: CÔNG TY NHIỀU PHÒNG BAN

```
PLANBOOK-AI COMPANY
├── Phòng Auth (Bộ phận xác nhận nhân viên)
│   ├── Quản lý: Tài khoản (email, password, JWT token)
│   ├── TỦ HỒ SƠ: db_auth
│   └── Người: Admin quản lý
│
├── Phòng User (Bộ phận Nhân sự)
│   ├── Quản lý: Thông tin profile (avatar, phone, school)
│   ├── TỦ HỒ SƠ: db_user
│   └── Người: HR quản lý
│
├── Phòng Exam (Bộ phận Thi)
│   ├── Quản lý: Bài thi (exam papers, submissions, results)
│   ├── TỦ HỒ SƠ: db_exam
│   └── Người: Exam coordinator quản lý
│
├── Phòng Question Bank (Kho câu hỏi)
│   ├── Quản lý: Câu hỏi, đáp án, mức độ
│   ├── TỦ HỒ SƠ: db_question
│   └── Người: Content team quản lý
│
└── API GATEWAY (Bốn cửa chính)
    ├── Nhập: Request từ client (frontend)
    ├── Ra: Trả response lại client
    └── Như: Bồi bàn chính — khách không tự vào bếp
```

**Tại sao tách DB riêng?**
- Nếu phòng Exam lỗi → phòng Auth vẫn cho đăng nhập ✓
- Nếu phòng Exam bận → phòng Question Bank vẫn lục câu hỏi ✓
- Mỗi phòng tự quản lý hồ sơ của mình

---

## 3️⃣ SCHEMA vs DATA — PHÂN BIỆT RÕRÀNG

### **Schema = TEMPLATE (Định nghĩa tủ)**

```sql
-- File: V1__Create_users_table.sql (Migration)
-- Chạy 1 lần duy nhất

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,        ← Hộc 1: Email
    password_hash VARCHAR(255) NOT NULL,       ← Hộc 2: Password Hash
    full_name VARCHAR(255),                    ← Hộc 3: Tên
    role ENUM('ADMIN', 'TEACHER', 'STAFF'),   ← Hộc 4: Vai trò
    is_active BOOLEAN DEFAULT TRUE,            ← Hộc 5: Kích hoạt?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Đây chỉ là template, chưa có dữ liệu gì cả!**

### **Data = GIÁ TRỊ THỰC (Giấy tờ trong tủ)**

```
Khi user đăng ký:

┌──────────────────────────────────────────────┐
│ Row 1 (User thứ nhất)                        │
├──────────────────────────────────────────────┤
│ id: 1                                        │
│ email: khoivan@gmail.com      ← EMAIL THỰC  │
│ password_hash: $2a$10$8K1p... ← PASS THỰC   │
│ full_name: Khôi Văn                          │
│ role: TEACHER                                │
│ is_active: TRUE                              │
│ created_at: 2026-04-08 15:30:45              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Row 2 (User thứ hai)                         │
├──────────────────────────────────────────────┤
│ id: 2                                        │
│ email: teacher2@gmail.com     ← EMAIL THỰC  │
│ password_hash: $2a$10$... ← PASS THỰC       │
│ full_name: Minh Nguyễn                       │
│ role: TEACHER                                │
│ is_active: TRUE                              │
│ created_at: 2026-04-08 15:32:10              │
└──────────────────────────────────────────────┘
```

### **Bảng So Sánh**

| Khía cạnh | Schema | Data |
|---|---|---|
| **Là gì** | Cấu trúc bảng (Thiết kế tủ) | Giá trị cụ thể (Giấy tờ trong tủ) |
| **Khi tạo** | Migration file (V1, V2, ...) | Khi user hoạt động (INSERT) |
| **Thay đổi** | ALTER TABLE (add cột) | INSERT/UPDATE/DELETE (modify data) |
| **Lần chạy** | 1 lần (MỖI migration) | N lần (N users) |
| **Ví dụ** | "Có cột email" | "khoivan@gmail.com" |

---

## 4️⃣ MIGRATION = CHẠY 1 LẦN THÔI (Flyway)

### **Cơ chế Flyway:**

```
Migration files: V1, V2, V3, V4...
                ↓
Khi app start lần 1:
├─ Flyway check: "Có file nào chưa run?"
├─ Tìm thấy: V1, V2, V3 chưa run
├─ Run V1 (CREATE TABLE users)
├─ Run V2 (CREATE TABLE refresh_tokens)
├─ Ghi vào flyway_schema_history:
│  ├─ V1 → success
│  └─ V2 → success
└─ Ready ✓

Khi app restart lần 2:
├─ Flyway check: "Có file nào chưa run?"
├─ Tìm thấy V1, V2 đã ghi vào history
├─ Skip V1, V2 (đã run rồi)
├─ Tìm thấy V3 chưa run
├─ Run V3 (chỉ file mới)
└─ Ready ✓
```

### **flyway_schema_history Table:**

```
┌────┬───────────────────────────┬─────────┐
│ id │ version                   │ success │
├────┼───────────────────────────┼─────────┤
│ 1  │ V1__Create_users_table    │ 1       │
│ 2  │ V2__Create_refresh_tokens │ 1       │
│ 3  │ V3__Add_last_login        │ 1       │
└────┴───────────────────────────┴─────────┘
```

**Lưu ý:**
- ✅ Mỗi migration file chạy đúng 1 lần
- ✅ Flyway auto track (không bao giờ quên)
- ✅ Mới add file → Flyway tự run
- ❌ KHÔNG delete/modify migration file cũ (danger!)

---

## 5️⃣ DATABASE STORAGE: RAM vs DISK

### **Nếu lưu ở RAM:**

```
App chạy:
┌─────────────────────────┐
│ RAM (Tạm thời)          │
│ users = [               │
│   { id: 1, email: ... } │
│   { id: 2, email: ... } │
│ ]                       │
└─────────────────────────┘
        ↓
App crash / Restart:
├─ RAM xóa hết
├─ Dữ liệu biến mất
└─ ❌ KHÔNG ôn lại được
```

### **Khi lưu ở Disk (MySQL làm việc này):**

```
User INSERT data:
└─ MySQL ghi vào /var/lib/mysql/db_auth/users.ibd
   (File binary trên ổ cứng — persistent)

App crash / Restart:
├─ HDD/SSD vẫn có file
├─ Dữ liệu còn đó
├─ App start lại → đọc từ disk
└─ ✓ Dữ liệu vẫn sống mãi
```

**MySQL cơ chế:**
1. Nhận INSERT command
2. Ghi vào WAL (Write-Ahead Log)
3. Ghi vào tablespace file (.ibd)
4. Xác nhận success → response client

→ **Kết quả: Dữ liệu KHÔNG bao giờ mất** (trừ HDD bị hỏng)

---

## 6️⃣ TEST DB vs DEV DB vs PROD DB

### **3 Cái Tủ Khác Nhau:**

```
┌─────────────────┬─────────────────┬─────────────────┐
│ TEST DB         │ DEV DB          │ PROD DB         │
├─────────────────┼─────────────────┼─────────────────┤
│ Sống ở: RAM/    │ Sống ở: Docker  │ Sống ở: AWS RDS │
│ TestContainers  │ (localhost:3307)│ (online)        │
├─────────────────┼─────────────────┼─────────────────┤
│ Sống bao lâu:   │ Sống bao lâu:   │ Sống bao lâu:   │
│ Tạm (xóa sau    │ Dev / khi app   │ MÃIMÃI (thật)   │
│ test)           │ chạy            │                 │
├─────────────────┼─────────────────┼─────────────────┤
│ Data: Test data │ Data: Dummy     │ Data: THẬT      │
│ (test@test.com) │ (seed data)      │ (teacher@...)   │
├─────────────────┼─────────────────┼─────────────────┤
│ Mục đích:       │ Mục đích:       │ Mục đích:       │
│ Kiểm tra logic  │ Local dev +     │ Live servers    │
│ code            │ debug           │ real users      │
├─────────────────┼─────────────────┼─────────────────┤
│ Backup: Không   │ Backup: Không   │ Backup: Tự động│
│                 │                 │ (1x/ngày)       │
└─────────────────┴─────────────────┴─────────────────┘
```

### **Lifecycle:**

```
1️⃣ TEST DB (Mỗi test):
   Spin up → Run migrations → Seed test data → Run test → Cleanup
   ↓
2️⃣ DEV DB (Dev phase):
   docker compose up → Migrations run 1 lần → Seed dummy users
   ↓ (Persistent khi restart app)

3️⃣ PROD DB (Production):
   Deploy to AWS → Migrations run 1 lần → Real users insert data
   ↓ (Backup tự động, data vĩnh viễn)
```

---

## 7️⃣ VÍ DỤ THỰC TẾ: User Đăng Ký + Đăng Nhập

### **Lúc Test (Test DB - Tạm):**

```java
@Test
void testLoginSuccess() {
    // ← TEST DB spin up (tạm)
    // ← Flyway: V1, V2, V3 apply → schema ready
    // ← Seed: INSERT test_user@test.com

    LoginRequest req = new LoginRequest("test_user@test.com", "Pass@123");
    AuthResponse res = authService.login(req);

    assertThat(res.getAccessToken()).isNotBlank(); ✓

    // ← TEST end: DROP TEST DB (xóa hành)
}
```

### **Lúc Dev (Dev DB - Persistent):**

```
docker compose up
├─ MySQL start → db_auth created
├─ Flyway run V1, V2, V3 (1 lần)
├─ seed-data INSERT:
│  ├─ admin@planbook.ai
│  └─ teacher1@gmail.com
└─ Dev ready ✓

Developer thử login:
POST /api/auth/login
{
  "email": "teacher1@gmail.com",
  "password": "Planbook@2026"
}
→ Success ✓
→ Data lưu vào DEV DB (persistent)

Restart app:
├─ TEST DB tồn tại (on disk)
├─ Flyway skip V1, V2, V3 (đã run)
├─ seed-data INSERT IGNORE (không duplicate)
└─ Data vẫn giữ được ✓
```

### **Lúc Prod (Prod DB - Thật):**

```
Deploy to AWS
├─ App start
├─ Flyway run V1, V2, V3 (lần 1)
├─ seed-data: SKIP (production cẩn thận)
└─ App ready ✓

Real teachers hoạt động:
├─ teacher@hcm-school.edu registers
│  └─ INSERT teacher@hcm-school.edu, hash → PROD DB
├─ teacher@hcm-school.edu logins
│  └─ SELECT * FROM users WHERE email=... → PROD DB
├─ Create exam
│  └─ INSERT bài thi → exam-service DB
└─ Data sống mãi (backup 1x/ngày)

Add feature mới (V4):
├─ Commit V4__Add_subscription.sql
├─ Deploy → Flyway apply V4
├─ V1, V2, V3 skip
├─ V4 run (ALTER TABLE users ADD subscription_id)
├─ Dữ liệu cũ vẫn giữ ✓
└─ App continue ✓
```

---

## 8️⃣ NHỮNG ĐIỀU CẦN LƯU Ý

### **✅ GOOD PRACTICES**

1. **Mỗi service = DB riêng**
   - Không query chéo DB
   - Giao tiếp qua API REST

2. **Migration = Version control cho schema**
   - Mỗi file 1 lần chạy
   - Flyway auto track
   - Không modify file cũ

3. **Test DB ≠ Dev/Prod DB**
   - Test DB: Tạm, clean lần nào nghiệm lần nấy
   - Dev DB: Persistent, seed dummy data
   - Prod DB: Persistent, thật user data, backup auto

4. **Schema vs Data**
   - Schema: Định nghĩa 1 lần (migration)
   - Data: Insert N lần (khi user hoạt động)

5. **Storage**
   - RAM: Tạm (mất khi shutdown)
   - Disk: Vĩnh viễn (khi restart vẫn có)

### **❌ ANTI-PATTERNS (Tránh!)**

1. ❌ Modify migration file cũ
   - → Nó đã run, Flyway không run lại
   - Fix: Tạo file mới V2, V3...

2. ❌ 1 DB cho tất cả service
   - → Coupling, scale khó
   - Fix: Mỗi service DB riêng

3. ❌ Dùng dev DB cho test
   - → Test data ô nhiễm dev
   - Fix: TestContainers, separate test DB

4. ❌ Hard-code seed data
   - → Khó maintain, fix theo thời gian
   - Fix: Fixture builders, factories nhẹ hơn

5. ❌ Trust RAM (không save disk)
   - → Data mất khi crash
   - Fix: MySQL auto handle (persistent)

---

## 9️⃣ PLANNING: ADD NEW SERVICE (Ví dụ: Curriculum)

**Workflow:**

```
1️⃣ Tạo folder: curriculum-service/
   └── pom.xml, Java code, ...

2️⃣ Tạo migration:
   curriculum-service/src/main/resources/db/migration/
   ├─ V1__Create_subjects_table.sql
   ├─ V2__Create_chapters_table.sql
   └─ V3__Create_topics_table.sql

3️⃣ Add docker-compose:
   curriculum-service:
     env: DB_URL=jdbc:mysql://mysql:3306/db_curriculum  ← New DB
     ports: 8083:8083

4️⃣ Add to init-databases.sql:
   CREATE DATABASE IF NOT EXISTS db_curriculum;

5️⃣ When service starts:
   ├─ MySQL: db_curriculum created
   ├─ Flyway: V1, V2, V3 run
   ├─ Schema ready ✓
   └─ App ready ✓

6️⃣ API Integration:
   API Gateway (8080)
   └─ Route /api/curriculum/* → Service (8083)
   └─ Other services continue work ✓
```

---

## 🔟 RECAP BẰNG TỦ

```
┌────────────────────────────────────────────────────────┐
│ CÁI TỦ (DATABASE) = KHOẢNG KHÔNG LƯU TRỮ              │
├────────────────────────────────────────────────────────┤
│                                                        │
│ HỘC (Column) = những phần chia trong tủ              │
│ ├─ email (hộc 1) — store email                        │
│ ├─ password_hash (hộc 2) — store password             │
│ ├─ role (hộc 3) — store vai trò                       │
│ └─ ... (more compartments)                            │
│                                                        │
│ NHÃN = Tên hộc (VARCHAR, BIGINT, ENUM)               │
│                                                        │
│ DỮ LIỆU = Giấy tờ trong hộc                          │
│ ├─ khoivan@gmail.com (vào hộc email)                 │
│ ├─ $2a$10$8K1p... (vào hộc password_hash)            │
│ └─ TEACHER (vào hộc role)                            │
│                                                        │
│ NHIỀU HỘC ĐẦY ĐỦ = 1 ROW (1 user)                    │
│                                                        │
│ NHIỀU ROW = NHIỀU USER                                │
│                                                        │
│ LƯUMEN: Tủ nằm trên DISK (8/SSD) → persistent ✓      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📌 FINAL NOTES

**Cần nhớ:**
- Microservice = DB per service (Isolation)
- Schema chạy 1 lần (Flyway track)
- Data insert N lần (khi user hoạt động)
- Test DB ≠ Dev/Prod (tạm vs persistent)
- Migration là version control của schema
- RAM tạm, Disk vĩnh viễn
- Scalability: Tách service → tách DB → tách scale

**Khi dev:**
- Test chạy trên TEST DB (clean lần nào lần nấy)
- Local chạy trên DEV DB (seed dummy data, persistent)
- Full integration → docker compose up

**Khi deploy:**
- Prod chạy trên AWS RDS (managed, backup auto)
- Migration run tự động (Flyway xử lý)
- KHÔNG run seed-data production (real data từ users)

---

*Ghi chú: Các khái niệm này từ learning session về Database + Microservice Architecture cho PlanBook-AI (Capstone Project, April 2026)*
