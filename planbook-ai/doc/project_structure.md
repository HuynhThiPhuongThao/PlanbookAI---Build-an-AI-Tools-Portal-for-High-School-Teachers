# PlanbookAI – Cấu trúc Thư mục & Chức năng

## Cây thư mục toàn dự án

```
d:/XDOPP/planbook-ai/
├── auth-service/          ← Service xác thực (port 8081)
├── user-service/          ← Service quản lý profile (port 8082)
├── curriculum-service/    ← Service chương trình học (port 8083) [TODO]
├── question-bank-service/ ← Service ngân hàng câu hỏi (port 8084) [TODO]
├── exam-service/          ← Service thi cử (port 8085) [TODO]
├── ai-service/            ← Service AI Gemini (port 8086) [TODO]
├── package-service/       ← Service gói dịch vụ (port 8087) [TODO]
├── api-gateway/           ← Cổng vào duy nhất (port 8080) [TODO]
├── docker-compose.yml     ← Chạy tất cả service cùng lúc
├── init-db.sql            ← Script tạo DB
└── .env.example           ← Biến môi trường mẫu
```

---

## auth-service/ – Xác thực danh tính

```
src/main/java/com/planbook/auth/
├── AuthServiceApplication.java         → Điểm khởi động app
├── entity/
│   ├── User.java                       → Bảng users (email, password_hash, role)
│   ├── Role.java                       → Enum: ADMIN, MANAGER, STAFF, TEACHER
│   └── RefreshToken.java               → Bảng refresh_tokens
├── repository/
│   ├── UserRepository.java             → findByEmail
│   └── RefreshTokenRepository.java     → findByToken
├── dto/
│   ├── LoginRequest.java               → Nhận {email, password}
│   ├── RegisterRequest.java            → Nhận {email, password, fullName}
│   └── AuthResponse.java               → Trả {accessToken, refreshToken}
├── service/
│   └── AuthService.java                → Logic: đăng ký, đăng nhập, refresh
├── security/
│   ├── JwtService.java                 → TẠO + verify JWT token
│   ├── JwtAuthFilter.java              → Filter đọc token mỗi request
│   └── UserDetailsServiceImpl.java     → Load user từ DB
├── controller/
│   └── AuthController.java             → POST /register, /login, /refresh, /logout
├── config/
│   └── SecurityConfig.java             → Cấu hình Spring Security
└── exception/
    └── GlobalExceptionHandler.java     → Bắt lỗi → trả JSON
```

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| POST | /api/auth/register | Đăng ký Teacher |
| POST | /api/auth/login | Đăng nhập → JWT |
| POST | /api/auth/refresh | Làm mới accessToken |
| POST | /api/auth/logout | Đăng xuất |

---

## user-service/ – Quản lý hồ sơ

```
src/main/java/com/planbook/user/
├── UserServiceApplication.java
├── entity/
│   ├── UserProfile.java                → Bảng user_profiles (avatar, phone, school...)
│   └── Role.java                       → Enum (copy từ auth-service)
├── repository/
│   └── UserProfileRepository.java      → findByEmail, findByRole, findByActive
├── dto/
│   ├── UserResponse.java               → Data trả về client
│   └── UpdateProfileRequest.java       → Data client gửi lên
├── service/
│   └── UserService.java                → getProfile, updateProfile, activate/deactivate
├── security/
│   ├── JwtUtil.java                    → CHỈ ĐỌC JWT
│   └── JwtAuthFilter.java              → Filter xác thực token
├── controller/
│   └── UserController.java             → GET/PUT /me, manage users
├── config/
│   └── SecurityConfig.java             → Security + mở Swagger
└── exception/
    └── GlobalExceptionHandler.java     → Lỗi 403, 404, 500
```

| Method | Endpoint | Ai dùng | Chức năng |
|--------|----------|---------|-----------|
| GET | /api/users/me | Tất cả | Xem profile |
| PUT | /api/users/me | Tất cả | Cập nhật profile |
| GET | /api/users | Admin | DS tất cả user |
| GET | /api/users/{id} | Admin | Xem bất kỳ user |
| PUT | /api/users/{id}/deactivate | Admin | Khóa tài khoản |
| PUT | /api/users/{id}/activate | Admin | Mở tài khoản |

---

## Luồng hoạt động

```
Đăng nhập:
  POST /api/auth/login → JWT (24h) + refreshToken (30 ngày)

Gọi API:
  GET /api/users/me + Header "Authorization: Bearer <token>"
  → JwtAuthFilter đọc token → extract userId
  → UserService.getProfile(userId) → DB → UserResponse JSON
```

---

## Database mỗi service

| Service | DB | Bảng chính |
|---------|----|-----------|
| auth-service | db_auth | users, refresh_tokens |
| user-service | db_user | user_profiles |
| curriculum-service | db_curriculum | subjects, chapters, topics, lesson_plans |
| question-bank-service | db_question | questions, question_options |
| exam-service | db_exam | exams, submissions, results |
| package-service | db_package | packages, orders, subscriptions |

> Các service KHÔNG query chéo DB – giao tiếp qua REST API.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21 + Spring Boot 3.2.3 |
| Database | MySQL 8.0 |
| Auth | JWT (JJWT 0.12.3) |
| Code gen | Lombok 1.18.36 |
| API Docs | Springdoc (Swagger) |
| AI | Google Gemini API |
| Storage | Supabase Storage |
| Deploy | Docker + Docker Compose |
| Frontend | ReactJS |
