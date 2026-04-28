# PlanbookAI Demo Guide

## 1. Chạy hệ thống local

```powershell
cd D:\XDOPP\planbook-ai
docker compose up -d --build
docker compose ps
```

Mở frontend:

```text
http://localhost:3000
```

Tài khoản demo:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@planbook.ai | admin@123 |
| Manager | manager@gmail.com | admin@123 |
| Staff | staff@gmail.com | admin@123 |
| Teacher | teacher1@gmail.com | admin@123 |

## 2. Kịch bản demo khuyến nghị

### Bước 1: Admin

1. Đăng nhập Admin.
2. Mở `Chương Trình Giảng Dạy`.
3. Tạo hoặc xem `Mẫu giáo án`.
4. Giải thích: Admin định nghĩa khung giáo án chuẩn gồm thông tin bài học, mục tiêu, học liệu, tiến trình dạy học và đánh giá.
5. Mở `Theo Dõi Doanh Thu` để xem gói dịch vụ, đăng ký và doanh thu ước tính.
6. Mở `Cấu Hình Hệ Thống` để chứng minh cấu hình hệ thống được lưu backend.

### Bước 2: Staff

1. Đăng nhập Staff.
2. Mở `Soạn giáo án mẫu`.
3. Chọn Môn → Chương → Bài → Khung giáo án từ Admin.
4. Gọi AI sinh nội dung, chỉnh sửa, lưu, gửi Manager duyệt.
5. Mở `Xây dựng ngân hàng câu hỏi`.
6. Tạo câu hỏi theo môn/chương/bài/độ khó. Câu hỏi sẽ ở trạng thái chờ duyệt.
7. Mở `CRUD mẫu lời nhắc AI`.
8. Tạo hoặc sửa prompt. Prompt gửi Manager duyệt trước khi được dùng.

### Bước 3: Manager

1. Đăng nhập Manager.
2. Duyệt hoặc từ chối giáo án mẫu Staff gửi lên.
3. Duyệt hoặc từ chối câu hỏi ngân hàng.
4. Duyệt hoặc từ chối prompt AI.
5. Mở phần `Quản lý gói cước`, tạo/sửa/bật/tắt gói.
6. Kiểm tra đơn đăng ký gói do Teacher gửi.

### Bước 4: Teacher

1. Đăng nhập Teacher.
2. Mở `Gói dịch vụ`, đăng ký một gói. Đây là luồng payment demo/manual.
3. Mở `Lập kế hoạch bài học AI`.
4. Chọn Môn → Chương → Bài → Khung giáo án → Giáo án mẫu đã duyệt.
5. Gọi AI tạo giáo án và lưu.
6. Dùng `Xuất PDF` hoặc `Xuất Word` để trình diễn xuất tài liệu.
7. Mở `Tạo đề thi trắc nghiệm`.
8. Chọn bài học, độ khó, số câu. Hệ thống lấy câu hỏi đã duyệt từ ngân hàng.
9. Xuất đề thi PDF/Word.
10. Mở `Chấm điểm OCR`, chọn đề, upload ảnh bài làm mẫu.
11. Mở `Kết quả học sinh`, xem phân tích và xuất CSV.

## 3. Điểm cần nói khi demo

- Admin tạo khung giáo án, Staff/Teacher dùng khung đó để sinh giáo án đúng cấu trúc.
- Staff tạo nội dung mẫu và câu hỏi, Manager kiểm duyệt trước khi Teacher sử dụng.
- Teacher không tự lấy dữ liệu trôi nổi, mà tạo giáo án/đề thi từ tài nguyên đã duyệt.
- AI hỗ trợ sinh nội dung, nhưng vẫn có bước con người kiểm tra và phê duyệt.
- OCR chỉ áp dụng tốt cho bài trắc nghiệm và cần ảnh rõ.

## 4. Nếu OCR lỗi khi demo

Kiểm tra nhanh:

1. `ai-service` đang chạy.
2. `GEMINI_API_KEY` đã có trong env.
3. Ảnh bài làm là `.jpg`, `.jpeg` hoặc `.png`.
4. Ảnh có đáp án rõ dạng `1. A`, `2. B`, hoặc bảng đáp án.
5. Đề thi đã có `answerKey`.

Nếu không chắc ảnh OCR, hãy demo phần tạo đề và giải thích OCR là bước xử lý ảnh, kết quả phụ thuộc chất lượng ảnh.

