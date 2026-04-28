# Source Code Documentation

## 1. Tổng quan source code

Project được tổ chức theo mô hình nhiều service:

| Thư mục | Vai trò |
| --- | --- |
| `frontend/` | React frontend cho Admin, Manager, Staff, Teacher |
| `api-gateway/` | Gateway xác thực JWT và forward request |
| `auth-service/` | Đăng nhập, đăng ký, refresh token |
| `user-service/` | Hồ sơ người dùng, avatar, FCM token |
| `curriculum-service/` | Môn/Chương/Bài, template giáo án, giáo án mẫu, giáo án cá nhân, system config |
| `question-bank-service/` | Ngân hàng câu hỏi, duyệt câu hỏi, gợi ý AI |
| `exam-service/` | Tạo đề thi, lưu bài nộp, OCR grading, kết quả |
| `ai-service/` | Gemini AI cho giáo án, bài tập, OCR, prompt |
| `packageservice/` | Gói dịch vụ, đăng ký, doanh thu |
| `db/` | SQL schema và seed dữ liệu |
| `doc/` | Tài liệu dự án |

## 2. Luồng dữ liệu chính

### 2.1 Đăng nhập

1. Frontend gọi `POST /api/auth/login`
2. Gateway forward tới `auth-service`
3. Auth trả JWT
4. Frontend lưu `access_token`
5. Gateway đọc JWT, forward `X-User-Id` và `X-Role` cho downstream service

### 2.2 Staff gửi giáo án mẫu

1. Staff tạo giáo án mẫu trong `curriculum-service`
2. Giáo án lưu trạng thái `DRAFT`
3. Staff bấm gửi duyệt → `PENDING_REVIEW`
4. `curriculum-service` gọi `user-service` lấy danh sách FCM token của Manager
5. Firebase push thông báo cho Manager

### 2.3 Manager duyệt

1. Manager xem danh sách `pending`
2. Duyệt hoặc từ chối
3. `curriculum-service` cập nhật trạng thái
4. `curriculum-service` gọi `user-service` lấy FCM token của Staff
5. Firebase push thông báo về Staff

### 2.4 Teacher tạo giáo án

1. Teacher chọn môn/chương/bài
2. Frontend gọi `curriculum-service` lấy template ACTIVE và giáo án mẫu APPROVED
3. Frontend gọi `ai-service` để sinh giáo án
4. Teacher lưu giáo án vào `curriculum-service`

### 2.5 Teacher tạo đề thi và OCR

1. Teacher tạo đề từ `exam-service`
2. `exam-service` gọi `question-bank-service` lấy câu hỏi APPROVED
3. Teacher upload ảnh bài làm
4. `exam-service` gọi `ai-service` endpoint OCR
5. `ai-service` dùng Gemini Vision đọc đáp án
6. `exam-service` lưu submission và result

## 3. Điểm code cần chú ý

### Frontend

- `frontend/src/app/api/axiosClient.ts`: interceptor token và unwrap response
- `frontend/src/app/api/curriculumApi.ts`: chuẩn hóa response list/page
- `frontend/src/app/utils/promptDisplay.ts`: hiển thị prompt dạng text thay vì JSON thô
- `frontend/src/app/utils/exportUtils.ts`: export PDF/Word/CSV

### Backend

- `api-gateway/.../JwtAuthenticationFilter.java`: xác thực JWT và forward header
- `curriculum-service/.../SampleLessonPlanService.java`: gửi Manager notification khi Staff submit
- `curriculum-service/.../SampleLessonPlanReviewService.java`: gửi Staff notification khi Manager duyệt
- `exam-service/.../SubmissionService.java`: chấm OCR thật qua `ai-service`
- `user-service/.../UserController.java`: lưu và cung cấp FCM token

## 4. Công nghệ đang dùng

- Frontend: React + Vite
- Backend: Spring Boot
- AI/OCR: FastAPI + Gemini
- Database: MySQL
- Cache: Redis
- Container: Docker Compose

