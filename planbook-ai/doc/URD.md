# User Requirements Document - PlanbookAI

## 1. Mục tiêu

PlanbookAI hỗ trợ giáo viên THPT, trong phạm vi đồ án tập trung môn Hóa học, giảm thao tác thủ công khi soạn giáo án, xây dựng ngân hàng câu hỏi, tạo đề, tạo bài tập và chấm điểm trắc nghiệm bằng OCR.

## 2. Tác nhân

| Tác nhân | Nhu cầu chính |
| --- | --- |
| Admin | Quản lý người dùng, cấu hình hệ thống, quản lý khung chương trình, xem doanh thu |
| Manager | Quản lý gói dịch vụ, đơn đăng ký, phê duyệt giáo án mẫu, câu hỏi và prompt AI |
| Staff | Tạo giáo án mẫu, xây dựng ngân hàng câu hỏi, CRUD mẫu lời nhắc AI |
| Teacher | Tạo giáo án cá nhân, tạo bài tập/đề thi, dùng OCR chấm trắc nghiệm, xem kết quả |

## 3. Yêu cầu người dùng

### UR-01 Quản lý tài khoản
- Admin tạo tài khoản Staff/Manager.
- Người dùng đăng nhập, cập nhật hồ sơ và đổi mật khẩu.
- Hệ thống giới hạn chức năng theo vai trò.

### UR-02 Khung chương trình và template
- Admin tạo template giáo án theo môn, chương, bài/chủ đề.
- Staff và Teacher chọn template đã duyệt khi tạo giáo án.

### UR-03 Giáo án mẫu
- Staff tạo giáo án mẫu theo template.
- Manager duyệt hoặc từ chối giáo án mẫu.
- Teacher dùng giáo án mẫu đã duyệt làm tài liệu tham khảo.

### UR-04 Ngân hàng câu hỏi
- Staff/Teacher tạo câu hỏi theo môn, chương, chủ đề và độ khó.
- Manager duyệt hoặc từ chối câu hỏi trước khi dùng chính thức.
- Teacher lọc và tái sử dụng câu hỏi để tạo đề/bài tập.

### UR-05 Prompt AI
- Staff tạo, sửa, xóa prompt hướng dẫn sinh nội dung giáo dục.
- Manager duyệt prompt trước khi AI service sử dụng.
- Teacher dùng chức năng AI thông qua các prompt đã được phê duyệt.

### UR-06 Gói dịch vụ
- Manager tạo, sửa, bật/tắt gói dịch vụ.
- Teacher đăng ký gói.
- Manager duyệt/từ chối đăng ký ở mức thanh toán thủ công cho demo.

### UR-07 OCR chấm điểm
- Teacher upload ảnh phiếu trả lời trắc nghiệm.
- Hệ thống OCR đáp án, so với đáp án đúng và trả điểm/phản hồi.

## 4. Tiêu chí chấp nhận demo

- Đăng nhập được đủ 4 role.
- Staff tạo giáo án mẫu/câu hỏi/prompt và Manager duyệt được.
- Teacher tạo giáo án, tạo đề/bài tập, export PDF/Word/CSV.
- Teacher đăng ký gói và Manager xử lý được đăng ký.
- OCR chạy được với ảnh mẫu rõ, đúng định dạng hướng dẫn.
