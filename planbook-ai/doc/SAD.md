# Software Architecture Document - PlanbookAI

## 1. Kiến trúc tổng quan

PlanbookAI dùng kiến trúc N-tier kết hợp microservice:

```mermaid
flowchart LR
  FE["React Frontend"] --> GW["API Gateway :8080"]
  GW --> AUTH["auth-service :8081"]
  GW --> USER["user-service :8082"]
  GW --> CUR["curriculum-service :8083"]
  GW --> QB["question-bank-service :8084"]
  GW --> EXAM["exam-service :8085"]
  GW --> PKG["package-service :8087"]
  CUR --> AI["ai-service :8086"]
  QB --> AI
  EXAM --> AI
  CUR --> USER
  AUTH --> USER
  AUTH --> DB[("MySQL")]
  USER --> DB
  CUR --> DB
  QB --> DB
  EXAM --> DB
  PKG --> DB
  CUR --> FCM["Firebase Cloud Messaging"]
```

## 2. Thành phần

| Thành phần | Trách nhiệm |
| --- | --- |
| Frontend | UI theo role, gọi API, export PDF/Word/CSV, nhận Firebase notification |
| API Gateway | Định tuyến service, kiểm tra JWT, forward user headers |
| Auth Service | Đăng nhập, đăng ký, refresh token, tạo account nội bộ |
| User Service | Hồ sơ người dùng, FCM token, endpoint nội bộ cho service khác |
| Curriculum Service | Subject/chapter/topic/template, giáo án mẫu, giáo án teacher |
| Question Bank Service | Câu hỏi, gợi ý AI, duyệt câu hỏi |
| Exam Service | Tạo đề, bài nộp, kết quả, gọi OCR grading |
| Package Service | Gói dịch vụ, subscription, doanh thu demo |
| AI Service | Prompt, Gemini generation, OCR |
| MySQL | Lưu dữ liệu nghiệp vụ |

## 3. Bảo mật

- Frontend lưu access token và gửi qua `Authorization: Bearer`.
- Gateway xác thực JWT và thêm `X-User-Id`, `X-Role`.
- Service nội bộ dùng Spring Security/role annotation.
- Endpoint nội bộ như FCM token chỉ dùng giữa service trong Docker network.

## 4. Luồng phê duyệt nội dung

```mermaid
sequenceDiagram
  participant Staff
  participant Frontend
  participant Gateway
  participant Service
  participant Manager

  Staff->>Frontend: Tạo giáo án/câu hỏi/prompt
  Frontend->>Gateway: POST nội dung
  Gateway->>Service: Forward JWT + user headers
  Service-->>Frontend: Lưu trạng thái PENDING
  Manager->>Frontend: Mở dashboard duyệt
  Frontend->>Gateway: GET danh sách PENDING
  Gateway->>Service: Lấy nội dung
  Manager->>Frontend: Duyệt hoặc từ chối
  Frontend->>Gateway: PUT approve/reject
  Gateway->>Service: Cập nhật trạng thái
```

## 5. Triển khai

- Local demo: Docker Compose.
- Production đề xuất: VPS/AWS EC2 chạy Docker Compose hoặc ECS/RDS nếu cần mở rộng.
- Render free không phù hợp cho toàn bộ stack vì nhiều service, MySQL persistent và AI/OCR cần runtime ổn định.
