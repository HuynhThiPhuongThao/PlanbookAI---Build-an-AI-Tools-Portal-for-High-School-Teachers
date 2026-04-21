# PlanbookAI - Database Schema & Registration Flow

## 📦 Database Architecture

PlanBook-AI sử dụng **Microservice Pattern** với mỗi service có database riêng:

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (React + Vite)                                 │
│  - Register form → POST /api/auth/register              │
│  - Login form → POST /api/auth/login                    │
└────────────────────────┬────────────────────────────────┘
                         │
                ┌────────▼─────────┐
                │ API Gateway      │
                │ (port 8080)      │
                └────────┬─────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
   ┌──────▼───────┐          ┌─────────▼──────┐
   │ Auth-Service │          │ User-Service   │
   │ (port 8081)  │          │ (port 8082)    │
   └──────┬───────┘          └─────────┬──────┘
          │                            │
   ┌──────▼───────┐          ┌─────────▼──────┐
   │   db_auth    │          │   db_user      │
   │ (MySQL 8.0)  │          │ (MySQL 8.0)    │
   └──────────────┘          └────────────────┘
```

## 🔐 Dữ liệu Lưu Trữ

### 1️⃣ db_auth (Auth Service)

Lưu **thông tin xác thực** - tối thiểu, chỉ cần để đăng nhập:

#### users table
```sql
id                BIGINT      PK, Auto-increment
email             VARCHAR     UNIQUE, NOT NULL (dùng để login)
password_hash     VARCHAR     bcrypt-hashed, NOT NULL
full_name         VARCHAR     Tên user (optional)
role              VARCHAR     ADMIN|MANAGER|STAFF|TEACHER (default: TEACHER)
is_active         BOOLEAN     True=active, False=bị khóa (default: True)
created_at        TIMESTAMP   Lúc tạo tài khoản
updated_at        TIMESTAMP   Lúc cập nhật
```

#### refresh_tokens table
```sql
id              BIGINT          PK
user_id         BIGINT          FK → users.id
token           TEXT            JWT refresh token (dài hạn)
expires_at      TIMESTAMP       Thời gian hết hạn
created_at      TIMESTAMP       Lúc tạo
```

### 2️⃣ db_user (User Service)

Lưu **thông tin hồ sơ chi tiết** - thông tin mở rộng của user:

#### user_profiles table
```sql
user_id           BIGINT      PK (copy từ db_auth.users.id - NO FK)
email             VARCHAR     UNIQUE (copy từ db_auth)
full_name         VARCHAR     Tên đầy đủ
role              VARCHAR     ADMIN|MANAGER|STAFF|TEACHER
avatar_url        VARCHAR     Link ảnh đại diện
phone_number      VARCHAR     Số điện thoại
school_name       VARCHAR     Tên trường giáo dục
subject_specialty VARCHAR     Môn dạy / chuyên ngành
bio               TEXT        Giới thiệu cá nhân
is_active         BOOLEAN     Active status (True/False)
created_at        TIMESTAMP   Lúc tạo profile
updated_at        TIMESTAMP   Lúc update
```

## 📋 Quy Trình Registration

### Bước 1: Frontend gửi form
```typescript
// Register.tsx
authApi.register({
  email: 'teacher@school.com',
  password: 'mypassword123',
  fullName: 'Nguyễn Văn A',
  role: 'TEACHER'
})
```

### Bước 2: API Gateway nhận & route
```
POST http://localhost:8080/api/auth/register
  └─ route to Auth-Service (8081)
```

### Bước 3: Auth-Service xử lý
```java
// AuthService.register()

1. Check: email đã tồn tại? → Nếu có throw error
2. Hash password: plaintext → bcrypt
3. Create User entity:
   - email: "teacher@school.com"
   - password_hash: "$2a$10$Zy...encrypted..."
   - fullName: "Nguyễn Văn A"
   - role: Role.TEACHER
   - is_active: true
4. Save vào db_auth.users
5. Generate JWT tokens:
   - accessToken (24h)
   - refreshToken (7 days)
6. Lưu refreshToken vào db_auth.refresh_tokens
7. Trả về JSON response:
   {
     "accessToken": "eyJhbG...",
     "refreshToken": "eyJhbG...",
     "user": {
       "id": 1,
       "email": "teacher@school.com",
       "fullName": "Nguyễn Văn A",
       "role": "TEACHER"
     }
   }
```

### Bước 4: Frontend lưu token
```typescript
// Login.tsx xử lý response
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
navigate('/teacher'); // redirect to dashboard
```

### Bước 5: (Optional) User cập nhật profile
```
PUT http://localhost:8080/api/users/me
  Headers: Authorization: Bearer <accessToken>
  Body: {
    avatarUrl: "https://...",
    phoneNumber: "0987654321",
    schoolName: "THPT Nguyễn Huệ",
    subjectSpecialty: "Văn"
  }
  └─ route to User-Service (8082)

User-Service:
1. Verify JWT token (từ axiosClient interceptor)
2. Extract userId từ token claims
3. Create/Update UserProfile trong db_user.user_profiles
```

## 🔗 Mối Quan Hệ Giữa Services

```
db_auth.users (user_id=1, email="teacher@...")
           │
           │ Application link via email
           ▼
db_user.user_profiles (user_id=1, email="teacher@...")
```

**WHY NO FOREIGN KEY?**
- Microservice pattern: mỗi service độc lập
- Nếu có physical FK → tight coupling
- Nếu user bị xóa ở auth → phải cascade clean db_user
- Thay vào đó: **application logic** dùng user_id/email để link

## 📊 Dữ liệu Flow Chart

```
Registration Sequence:
─────────────────────

1. User điền form (Register.tsx)
   ↓
2. Frontend POST /api/auth/register (via axios)
   ↓
3. API Gateway forward to Auth-Service
   ↓
4. Auth-Service:
   - Validate email
   - Hash password (bcrypt)
   - Save User → db_auth.users ✅
   - Generate JWT tokens
   - Save refresh token → db_auth.refresh_tokens ✅
   ↓
5. Frontend nhận response:
   - accessToken (24h)
   - refreshToken (7 days)
   ↓
6. Frontend save tokens + redirect to login
   ↓
7. User login lại:
   - POST /api/auth/login
   - Auth-Service verify password
   - Generate new JWT pair
   ↓
8. User access /api/users/me:
   - User-Service extract userId from JWT
   - Query db_user.user_profiles
   - Return profile info ✅
```

## 🔑 Key Points

1. **Email là KEY** - dùng để link giữa db_auth và db_user
2. **Password chỉ lưu ở db_auth** - db_user KHÔNG lưu password
3. **JWT tokens không lưu DB** - chỉ có refresh token được store
4. **Microservice benefit**: Auth service độc lập scaling
5. **Stateless**: mỗi request đều có JWT để verify

## 🚀 Đề Xuất Improvement Sau Này

- [ ] Event-driven sync: Khi user update ở auth → publish event → user-service listen & sync
- [ ] Cache: Redis lưu user profile → giảm DB query
- [ ] Audit log: Log tất cả register/login/update events
- [ ] 2FA: Two-factor authentication cho admin accounts
- [ ] OAuth2: Google/Facebook integration for registration
