# PlanbookAI Implementation Status

## Đã đủ để demo

| Nhóm chức năng | Trạng thái | Ghi chú |
| --- | --- | --- |
| Đăng nhập và phân quyền | Đủ demo | Có Admin, Manager, Staff, Teacher. Frontend có route guard theo role. |
| Admin quản lý người dùng | Đủ demo | Admin tạo tài khoản nội bộ, khóa/mở tài khoản. |
| Admin quản lý khung giáo án | Đủ demo | Tạo template giáo án có cấu trúc, Staff/Teacher đọc template ACTIVE. |
| Admin doanh thu/cấu hình | Đủ demo | Doanh thu lấy từ package-service, cấu hình lưu backend. |
| Staff soạn giáo án mẫu | Đủ demo | Chọn môn/chương/bài/template, gọi AI, lưu, gửi duyệt. |
| Staff ngân hàng câu hỏi | Đủ demo | Tạo câu hỏi theo curriculum, gọi AI gợi ý, gửi Manager duyệt. |
| Staff CRUD prompt AI | Đủ demo | Tạo/sửa/xóa prompt, prompt hiển thị dạng text, gửi duyệt. |
| Manager duyệt nội dung | Đủ demo | Duyệt giáo án mẫu, câu hỏi và prompt. |
| Teacher tạo giáo án | Đủ demo | Chọn template Admin, giáo án mẫu đã duyệt, gọi AI và lưu. |
| Teacher tạo bài tập | Đủ demo | Gọi AI sinh câu hỏi trắc nghiệm, xuất PDF/Word. |
| Teacher tạo đề thi | Đủ demo | Lấy câu hỏi APPROVED từ ngân hàng, sinh đề và đáp án. |
| OCR chấm điểm | Đủ demo có điều kiện | Phụ thuộc ảnh rõ và Gemini API. |
| Kết quả học sinh | Đủ demo | Tổng hợp kết quả OCR, phân tích điểm và xuất CSV. |
| Gói dịch vụ | Đủ demo manual | Teacher đăng ký gói, Manager/Admin xem đơn. Chưa có cổng thanh toán thật. |
| Firebase notification | Đủ demo kỹ thuật | Lưu FCM token, Staff gửi bài thông báo Manager, Manager duyệt thông báo Staff. |
| Export tài liệu | Đủ demo | Giáo án/bài tập/đề thi xuất PDF qua print và Word `.doc`; kết quả xuất CSV. |

## Còn thiếu nếu làm production

| Hạng mục | Lý do |
| --- | --- |
| Thanh toán online | Hiện là đăng ký thủ công, chưa tích hợp VNPAY/MoMo/Stripe callback. |
| Notification nâng cao | Chưa có bảng notification inbox, chưa lưu lịch sử thông báo. |
| OCR ổn định production | Cần chuẩn hóa mẫu phiếu trả lời, test nhiều kiểu ảnh, xử lý xoay/mờ/thiếu sáng. |
| Export PDF server-side | Hiện PDF dùng browser print; production nên dùng server-side renderer nếu cần chuẩn form. |
| Logging/monitoring | Chưa có centralized log, alert, tracing. |
| CI/CD | Chưa có pipeline build-test-deploy tự động. |
| Test coverage | Có build/package nhưng cần thêm unit/integration/e2e tests cho các luồng chính. |

## Cải thiện nên làm sau bảo vệ

1. Tạo mẫu phiếu trả lời trắc nghiệm chuẩn để OCR ổn định hơn.
2. Thêm inbox thông báo trong web thay vì chỉ push notification.
3. Thêm duyệt đơn gói cước: Manager chuyển `PENDING` → `ACTIVE`.
4. Thêm giới hạn quota theo gói dịch vụ.
5. Thêm xuất PDF server-side cho đề thi/giáo án.
6. Thêm dashboard thống kê thật cho Teacher.
7. Thêm audit log cho hành động duyệt/từ chối.

