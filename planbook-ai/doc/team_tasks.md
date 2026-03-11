# PlanbookAI – Phân công Task Nhóm

## Nguyên tắc
- Mỗi người = 1 service BE + 1 page FE tương ứng
- Làm song song, không chờ nhau
- JWT secret phải GIỐNG NHAU ở tất cả service

---

## NGƯỜI 1 – Lead (Mày) XONG

### BE: auth-service + user-service
- [x] auth-service: Login, Register, JWT, Refresh token
- [x] user-service: CRUD profile, activate/deactivate

### FE
- [ ] /login, /register
- [ ] /profile – xem + sửa thông tin cá nhân

---

## NGƯỜI 2 – curriculum-service (port 8083)

### BE
File cần tạo:
- entity/ Subject, Chapter, Topic, LessonPlan, LessonPlanTemplate
- repository/ SubjectRepo, ChapterRepo, TopicRepo, LessonPlanRepo
- dto/ SubjectResponse, ChapterResponse, LessonPlanResponse, CreateLessonPlanRequest
- service/ CurriculumService, LessonPlanService
- controller/ SubjectController, LessonPlanController
- config/ SecurityConfig (copy từ user-service, đổi package)
- exception/ GlobalExceptionHandler (copy)

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| GET | /api/subjects | Danh sách môn học |
| GET | /api/subjects/{id}/chapters | Chương theo môn |
| GET | /api/chapters/{id}/topics | Bài theo chương |
| GET | /api/lesson-plans | DS giáo án |
| POST | /api/lesson-plans | Tạo giáo án |
| PUT | /api/lesson-plans/{id} | Sửa giáo án |

### FE
- [ ] /teacher/lesson-plans – Danh sách giáo án
- [ ] /teacher/lesson-plans/create – Tạo giáo án (gọi AI)
- [ ] /teacher/lesson-plans/{id} – Chi tiết + sửa

---

## NGƯỜI 3 – question-bank-service (port 8084)

### BE
File cần tạo:
- entity/ Question, QuestionOption
- repository/ QuestionRepository, QuestionOptionRepository
- dto/ QuestionResponse, CreateQuestionRequest, UpdateQuestionRequest
- service/ QuestionService
- controller/ QuestionController
- config/ SecurityConfig + exception/

| Method | Endpoint | Role | Chức năng |
|--------|----------|------|-----------|
| GET | /api/questions | Teacher+ | DS câu hỏi |
| POST | /api/questions | Staff/Teacher | Tạo câu hỏi |
| PUT | /api/questions/{id} | Owner | Sửa |
| DELETE | /api/questions/{id} | Owner/Admin | Xóa |
| POST | /api/questions/{id}/approve | Manager | Duyệt |

### FE
- [ ] /teacher/questions – Xem + lọc
- [ ] /teacher/questions/create – Tạo câu hỏi MCQ
- [ ] /manager/approval – Duyệt câu hỏi
- [ ] /staff/questions – Quản lý ngân hàng

---

## NGƯỜI 4 – exam-service (port 8085)

### BE
File cần tạo:
- entity/ Exam, ExamQuestion, StudentSubmission, SubmissionResult
- repository/ ExamRepository, SubmissionRepository
- dto/ ExamResponse, CreateExamRequest, GradeResult
- service/ ExamService, GradingService
- controller/ ExamController
- client/ AiServiceClient (Feign gọi ai-service để OCR)
- config/ SecurityConfig, FeignConfig + exception/

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| POST | /api/exams | Tạo đề thi |
| GET | /api/exams | DS đề của Teacher |
| POST | /api/exams/{id}/submissions | Nộp bài (upload ảnh) |
| GET | /api/exams/{id}/results | Kết quả chấm |

### FE
- [ ] /teacher/exams/create – Tạo đề (chọn câu từ bank)
- [ ] /teacher/exams/grade – Upload ảnh, xem kết quả OCR
- [ ] /teacher/results – Bảng điểm học sinh

---

## NGƯỜI 5 – ai-service + package-service

### BE: ai-service (port 8086, stateless)
File cần tạo:
- service/ GeminiService, ExerciseGenService, ExamGenService, LessonPlanGenService, OcrGradingService
- controller/ AiController
- config/ GeminiConfig (API Key)

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| POST | /api/ai/generate-exercise | Sinh bài tập |
| POST | /api/ai/generate-exam | Sinh đề thi MCQ |
| POST | /api/ai/generate-lesson-plan | Sinh giáo án |
| POST | /api/ai/ocr-grade | Upload ảnh, chấm điểm |

### BE: package-service (port 8087)
- entity/ Package, Order, Subscription
- service/ PackageService, OrderService
- controller/ PackageController, OrderController

### FE
- [ ] /admin/users – Quản lý tài khoản
- [ ] /admin/dashboard – Thống kê
- [ ] /manager/packages – Gói dịch vụ
- [ ] /manager/orders – Đơn hàng

---

## CHUNG: api-gateway (Làm sau cùng)
- config/ RouteConfig, SecurityConfig
- filter/ RateLimitFilter

---

## Lưu ý quan trọng

1. JWT secret phải GIỐNG NHAU ở tất cả service (copy từ env)
2. SecurityConfig: copy từ user-service, đổi package là xong
3. Không JOIN DB chéo – gọi REST API của service kia nếu cần data
4. Swagger: http://localhost:PORT/swagger-ui.html
5. Test flow: đăng nhập auth-service lấy token → test service khác
