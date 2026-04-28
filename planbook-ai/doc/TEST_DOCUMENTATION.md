# Test Documentation

## 1. Mục tiêu kiểm thử

Đảm bảo các luồng chính của PlanbookAI hoạt động đúng theo role:

- Admin quản lý hệ thống và template
- Staff tạo nội dung mẫu
- Manager duyệt nội dung
- Teacher sử dụng công cụ AI, đề thi và OCR

## 2. Kiểm thử build

Frontend:

```powershell
cd frontend
npm run build
```

Backend:

```powershell
cd curriculum-service
mvn -DskipTests package
```

Lặp lại cho:

- `exam-service`
- `question-bank-service`
- `packageservice/packageservice`
- `api-gateway`

## 3. Kiểm thử smoke test API

### 3.1 Login

Kiểm tra login 4 role:

- `admin@planbook.ai`
- `manager@gmail.com`
- `staff@gmail.com`
- `teacher1@gmail.com`

Kỳ vọng:

- trả JWT
- frontend điều hướng đúng dashboard

### 3.2 Curriculum

Endpoint:

- `GET /api/subjects`
- `GET /api/chapters/by-subject?subjectId=1`
- `GET /api/topics/by-chapter?chapterId=1`
- `GET /api/curriculum-templates/active`

Kỳ vọng:

- trả danh sách môn/chương/bài
- template ACTIVE hiển thị trong Staff/Teacher

### 3.3 Staff

Test case:

1. Tạo giáo án mẫu
2. Lưu nháp
3. Gửi Manager duyệt
4. Tạo câu hỏi ngân hàng
5. Tạo/sửa prompt AI

Kỳ vọng:

- giáo án chuyển `PENDING_REVIEW`
- câu hỏi/prompt xuất hiện ở Manager

### 3.4 Manager

Test case:

1. Duyệt giáo án mẫu
2. Từ chối giáo án mẫu
3. Duyệt câu hỏi
4. Duyệt prompt

Kỳ vọng:

- trạng thái cập nhật đúng
- nội dung APPROVED có thể được Teacher sử dụng

### 3.5 Teacher

Test case:

1. Tạo giáo án bằng AI
2. Xuất PDF/Word
3. Tạo bài tập bằng AI
4. Tạo đề thi từ câu hỏi APPROVED
5. Upload ảnh OCR
6. Xem kết quả học sinh
7. Xuất CSV
8. Đăng ký gói dịch vụ

Kỳ vọng:

- giáo án lưu thành công
- file xuất tải/mở được
- đề thi có câu hỏi và đáp án
- OCR trả điểm nếu ảnh hợp lệ
- subscription chuyển `PENDING`

## 4. Test data

Seed chính:

```text
db/02-master-seed.sql
```

Ảnh OCR mẫu:

```text
doc/ocr_answer_sheet_sample.html
```

## 5. Rủi ro còn lại

- OCR phụ thuộc Gemini và chất lượng ảnh.
- Firebase notification phụ thuộc quyền notification của browser và service account.
- Payment là manual subscription, chưa có callback cổng thanh toán.

