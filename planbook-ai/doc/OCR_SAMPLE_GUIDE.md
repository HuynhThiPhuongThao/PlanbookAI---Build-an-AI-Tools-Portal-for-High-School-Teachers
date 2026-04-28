# OCR Sample Guide

## 1. Mục tiêu

OCR trong PlanbookAI dùng để chấm bài trắc nghiệm. Hệ thống lấy đáp án đúng từ đề thi đã tạo, sau đó AI đọc ảnh bài làm và trả về danh sách đáp án học sinh chọn.

## 2. Ảnh bài làm nên chuẩn bị

Nên chuẩn bị ảnh `.jpg` hoặc `.png` rõ nét, đủ sáng, không nghiêng nhiều.

Mẫu đơn giản để demo:

```text
Họ tên: Nguyễn Văn An
Đề: Smoke test exam

1. A
2. B
3. C
4. D
5. A
```

Nếu đề chỉ có 1 câu:

```text
Họ tên: Nguyễn Văn An
Đề: Smoke test exam

1. A
```

## 3. Quy trình demo OCR

1. Teacher tạo đề thi từ câu hỏi đã duyệt.
2. Ghi lại đáp án đúng của đề.
3. Tạo ảnh bài làm theo format trên.
4. Vào `Chấm điểm OCR`.
5. Chọn đề, nhập tên học sinh, upload ảnh.
6. Bấm `Chấm bài ngay`.
7. Xem điểm, số câu đúng/sai và feedback.
8. Vào `Kết quả học sinh` để xem phân tích.

## 4. Lỗi thường gặp

| Lỗi | Cách xử lý |
| --- | --- |
| AI không đọc được ảnh | Chụp ảnh rõ hơn, nền trắng, chữ to. |
| Không có đề thi | Vào `Tạo đề thi trắc nghiệm` tạo đề trước. |
| Đề không có câu hỏi | Cần có câu hỏi APPROVED trong ngân hàng. |
| OCR trả 503 | Kiểm tra `GEMINI_API_KEY` và `ai-service`. |
| Điểm sai | Kiểm tra ảnh có đúng thứ tự câu và đáp án A/B/C/D không. |

## 5. Ghi chú bảo vệ

Nên nói rõ phạm vi OCR hiện tại:

- áp dụng cho câu hỏi trắc nghiệm
- phụ thuộc chất lượng ảnh
- chưa thay thế hoàn toàn việc chấm tự luận
- phù hợp để giảm thời gian chấm phiếu đáp án

