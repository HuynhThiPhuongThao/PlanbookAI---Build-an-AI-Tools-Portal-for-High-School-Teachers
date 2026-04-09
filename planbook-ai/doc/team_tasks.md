# PlanbookAI – Phân công Task Nhóm (6 Người)

## Nguyên tắc Chung
- Mỗi người = 1 service BE (Backend) + 1 page FE (Frontend) tương ứng.
- Phải làm rõ Role (Quyền) nào được gọi API nào. Các Role chuẩn của hệ thống: `ADMIN`, `MANAGER`, `STAFF`, `TEACHER`.
- Làm song song, không chờ nhau. Test bằng Postman trước khi ráp thẻ FE.
- Cực kỳ lưu ý: **JWT secret phải GIỐNG NHAU** ở tất cả các service.

---

## 👨‍💻 NGƯỜI 1 – Lead (Mày) [XONG]

### Backend: `auth-service` (8081) + `user-service` (8082)
- [x] **auth-service**: Đăng ký (mặc định Role TEACHER), Đăng nhập lấy JWT, Refresh token. (Public API)
- [x] **user-service**: CRUD profile. Chỉ user (TEACHER, STAFF...) tự xem/sửa profile của mình. ADMIN có quyền xem tất cả và block (deactivate) tài khoản.

### Frontend
- [ ] Màn hình `/login`, `/register` (Public).
- [ ] Màn hình `/profile` – Teacher tự vào xem và sửa thông tin cá nhân.

---

## 👨‍💻 NGƯỜI 2 – `curriculum-service` (port 8083)

**Mục tiêu**: Quản lý khung chương trình học và Giáo án của Giáo viên.

### Backend
| Method | Endpoint | Role Yêu Cầu | Chức năng (Business Logic) |
|--------|----------|--------------|----------------------------|
| GET | `/api/subjects` | TEACHER, STAFF | Xem danh sách Môn học. |
| GET | `/api/subjects/{id}/chapters`| TEACHER, STAFF | Xem các Chương theo Môn. |
| GET | `/api/chapters/{id}/topics` | TEACHER, STAFF | Xem các Bài (Topic) theo Chương. |
| GET | `/api/lesson-plans` | TEACHER | Liệt kê các giáo án do *chính Teacher đó* tạo. |
| POST | `/api/lesson-plans` | TEACHER | Tạo giáo án mới. Lưu DB trạng thái "Draft" hoặc "Done". |
| PUT | `/api/lesson-plans/{id}`| TEACHER | Sửa giáo án (chỉ người tạo mới được sửa). |
| GET/POST/PUT/DELETE | `/api/lesson-templates` | ADMIN | **[THÊM MỚI]** Quản lý Khung giáo án chuẩn (Curriculum Framework) để làm mẫu gốc hệ thống. |

### Frontend
- [ ] Màn hình `/teacher/lesson-plans`: Bảng danh sách giáo án của Giáo viên.
- [ ] Màn hình `/teacher/lesson-plans/create`: Form tạo giáo án (Có thể có nút "Gọi AI gợi ý").
- [ ] Màn hình `/teacher/lesson-plans/{id}`: Xem chi tiết và edit giáo án.
- [ ] Màn hình `/admin/curriculum`: **[THÊM MỚI]** Giao diện cho Admin thiết kế khung giáo án mẫu cho toàn trường.

---

## 👨‍💻 NGƯỜI 3 – `question-bank-service` (port 8084)

**Mục tiêu**: Quản lý kho câu hỏi trắc nghiệm dùng chung cho hệ thống.

### Backend
| Method | Endpoint | Role Yêu Cầu | Chức năng |
|--------|----------|--------------|-----------|
| GET | `/api/questions` | TEACHER, STAFF, ADMIN| Xem DS câu hỏi (có phân trang, filter theo môn/chương/độ khó). |
| POST | `/api/questions` | STAFF, TEACHER | Tạo câu hỏi MCQ mới. Trạng thái mặc định: "PENDING" (chờ duyệt). |
| PUT | `/api/questions/{id}` | Tác giả (Tạo ra CH)| Sửa câu hỏi (chỉ khi chưa được duyệt). |
| DELETE | `/api/questions/{id}` | ADMIN | Xóa hẳn câu hỏi. |
| POST | `/api/questions/{id}/approve`| MANAGER | Quản lý duyệt câu hỏi ("PENDING" -> "APPROVED" để Teacher lấy ra xài). |

### Frontend
- [ ] Màn hình `/teacher/questions`: Trang để Teacher tìm kiếm, lọc câu hỏi từ Ngân hàng.
- [ ] Màn hình `/teacher/questions/create`: Form cho Teacher/Staff soạn câu hỏi đóng góp.
- [ ] Màn hình `/manager/approval`: Trang đặc quyền cho Manager vô xem các câu hỏi đang "Pending" để bấm nút [Duyệt] hoặc [Từ chối].

---

## 👨‍💻 NGƯỜI 4 – `exam-service` (port 8085)

**Mục tiêu**: Cho Giáo viên tạo Đề thi từ Ngân hàng câu hỏi và Chấm điểm học sinh.

### Backend
| Method | Endpoint | Role Yêu Cầu | Chức năng |
|--------|----------|--------------|-----------|
| POST | `/api/exams` | TEACHER | Tạo đề thi (lưu danh sách List ID Câu hỏi kéo từ question-bank sang). |
| GET | `/api/exams` | TEACHER | Xem danh sách các đề thi *của mình*. |
| POST | `/api/exams/{id}/submissions`| TEACHER | Nộp bài kiểm tra (Upload ảnh bài làm của học sinh). Gọi Feign sang AI để lấy điểm. |
| GET | `/api/exams/{id}/results` | TEACHER | Xem bảng kết quả điểm số lớp học. |

### Frontend
- [ ] Màn hình `/teacher/exams/create`: Giao diện chọn/kéo thả câu hỏi từ Bank để ghép thành tờ Đề thi.
- [ ] Màn hình `/teacher/exams/grade`: Chỗ để Teacher bấm [Upload File Ảnh] -> Hiện ra ảnh bài làm và Số điểm máy chấm.
- [ ] Màn hình `/teacher/results`: Xem bảng điểm tổng quát của kỳ thi đó.

---

## 👨‍💻 NGƯỜI 5 – `ai-service` (port 8086)

**Mục tiêu**: Tập trung toàn bộ logic tích hợp LLM (Gemini/ChatGPT) và Xử lý Ảnh (OCR), không dính líu DB nghiệp vụ.

### Backend (Cần gắn thêm DB nhỏ lưu template Prompt)
| Method | Endpoint | Tiêu thụ bởi Service nào? / Yêu cầu | Chức năng chi tiết |
|--------|----------|-----------------------------------------|--------------------|
| POST | `/api/ai/generate-exercise` | `question-bank-service` | Nhận prompt -> Trả về JSON chứa mảng câu hỏi trắc nghiệm. |
| POST | `/api/ai/generate-lesson-plan`| `curriculum-service` | Nhận chủ đề -> Trả về JSON dàn ý giáo án. |
| POST | `/api/ai/ocr-grade` | `exam-service` | Nhận MultipartFile (Ảnh) + Đáp án -> Gọi AI Vision đọc ảnh, so sánh đáp án -> Trả về JSON: ID câu sai, Tổng điểm. |
| GET/POST/PUT | `/api/ai/prompts` | STAFF, ADMIN | **[THÊM MỚI]** CRUD các câu lệnh Prompt mẫu cho AI thay vì code cứng, để có thể cấu hình động. |

### Frontend
- [ ] Màn hình `/staff/prompts`: **[THÊM MỚI]** Trang cho Staff vào chỉnh sửa, quản lý các mẫu câu lệnh (Prompting Templates) gọi AI.
- Hỗ trợ ráp API AI vào FE nếu khó.

---

## 👨‍💻 NGƯỜI 6 – `package-service` (port 8087) + `api-gateway` (port 8080)

**Mục tiêu**: Quản lý gói cước (Doanh thu) và Quản lý tài khoản Admin nội bộ + Cổng Gateway.

### Backend 1: `package-service`
| Method | Endpoint | Role Yêu Cầu | Chức năng |
|--------|----------|--------------|-----------|
| GET | `/api/packages` | Public, TEACHER | Xem các gói tài khoản (Gói Free, Gói Pro AI...). |
| POST | `/api/packages` | MANAGER | Tạo mới hoặc Sửa giá bán Gói cước. |
| POST | `/api/subscriptions` | TEACHER | Bấm mua gói -> Sinh ra đơn hàng/Subscription. |
| GET | `/api/internal/users/create`| ADMIN | (Đi qua API Gateway) - API nội bộ để Admin cấp account cho MANAGER / STAFF. |
| GET | `/api/revenue/stats` | ADMIN, MANAGER | **[THÊM MỚI]** Thống kê và báo cáo doanh thu tài chính từ việc bán các gói (Revenue Tracking). |

### Backend 2: `api-gateway`
- Cấu hình Route đẩy request tới các port 8081->8087.
- Gắn Global JWT Filter (Kiểm tra token hợp lệ trước khi cho lọt xuống Service nhánh).

### Frontend
- [ ] Màn hình `/admin/users`: Giao diện siêu quyền lực của ADMIN để Mời (Invite)/Tạo tài khoản giao quyền `MANAGER` hoặc `STAFF`.
- [ ] Màn hình `/manager/packages`: Trang cho Manager sửa giá, cấu hình các Gói cước bán lấy tiền.
- [ ] Màn hình `/teacher/billing`: Nơi Teacher xem mình đang xài Gói nào, sắp hết hạn chưa.
- [ ] Màn hình `/admin/revenue`: **[THÊM MỚI]** Bảng điều khiển xem Dashboard/Biểu đồ doanh thu dành cho Admin.

---

## 📌 Các bước test tích hợp (Integration Flow)
1. **NGƯỜI 6** chạy Seeder, tạo ra acc ADMIN mật khẩu `123456`. Dùng acc này login, lấy token. Dùng token đó lên web tạo acc `MANAGER`.
2. Dùng acc `MANAGER` login, gọi API `/api/packages` tạo gói bán "PlanbookAI Pro".
3. **Người ngoài** vào web, đăng ký tk `TEACHER`. Đăng nhập lấy Bearer Token.
4. `TEACHER` gọi API mua gói Pro của NGƯỜI 6.
5. Sau đó `TEACHER` lên màn hình của **NGƯỜI 3**, xài tool Auto Sinh Câu Hỏi, FE sẽ gọi `question-bank-service`, BE của NG3 dùng Feign call sang `ai-service` của **NGƯỜI 5**.
6. Cuối tháng, hệ thống trừ tiền, hết hạn token, gọi refresh lại từ auth-service của **NGƯỜI 1**.
