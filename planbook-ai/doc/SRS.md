# Software Requirements Specification - PlanbookAI

## 1. Phạm vi

Hệ thống là cổng công cụ AI cho giáo viên THPT, triển khai theo kiến trúc microservice/N-tier: React frontend, API Gateway, các Spring Boot service, AI FastAPI service và MySQL.

## 2. Yêu cầu chức năng

| Mã | Chức năng | Vai trò |
| --- | --- | --- |
| FR-01 | Đăng ký/đăng nhập/JWT refresh/logout | Teacher, Staff, Manager, Admin |
| FR-02 | Admin quản lý người dùng nội bộ | Admin |
| FR-03 | Admin quản lý template giáo án | Admin |
| FR-04 | Staff tạo giáo án mẫu theo template | Staff |
| FR-05 | Manager duyệt/từ chối giáo án mẫu | Manager |
| FR-06 | Staff/Teacher tạo và quản lý câu hỏi | Staff, Teacher |
| FR-07 | Manager duyệt/từ chối câu hỏi | Manager |
| FR-08 | Staff CRUD prompt AI | Staff |
| FR-09 | Manager duyệt/từ chối prompt AI | Manager |
| FR-10 | Teacher tạo giáo án bằng AI/template | Teacher |
| FR-11 | Teacher tạo bài tập, đề thi trắc nghiệm | Teacher |
| FR-12 | Teacher OCR chấm bài trắc nghiệm | Teacher |
| FR-13 | Teacher export PDF/Word/CSV | Teacher |
| FR-14 | Manager quản lý gói và đăng ký | Manager |
| FR-15 | Admin/Manager xem thống kê doanh thu | Admin, Manager |

## 3. Yêu cầu dữ liệu

- User/Auth: email, password hash, role, active status, profile, FCM token.
- Curriculum: subject, chapter, topic, template, sample lesson plan, lesson plan.
- Question bank: content, options, answer, difficulty, subject/chapter/topic, status.
- Prompt AI: name, type, content, version, status, review note.
- Package: package, subscription, payment method, status.
- Exam: exam, submission, result, OCR result.

## 4. Yêu cầu phi chức năng

- API dùng RESTful JSON, route qua API Gateway.
- JWT và RBAC áp dụng cho service cần bảo vệ.
- Docker Compose chạy được toàn bộ môi trường local demo.
- MySQL lưu dữ liệu nghiệp vụ chính.
- AI service tích hợp Gemini AI, có xử lý lỗi khi API key/OCR không khả dụng.
- Frontend phản hồi lỗi rõ ràng, tránh hiển thị JSON thô cho người dùng cuối.

## 5. Ràng buộc

- Thanh toán thật chưa tích hợp cổng thanh toán, hiện là workflow đăng ký thủ công phục vụ demo.
- OCR phụ thuộc chất lượng ảnh và Gemini API.
- Notification yêu cầu browser cấp quyền và cấu hình Firebase hợp lệ.
