# Installation Guide

## 1. Yêu cầu môi trường

- Docker Desktop
- Docker Compose
- Cổng còn trống: `3000`, `8080` đến `8087`, `3307`, `6379`
- File secrets Firebase nếu muốn demo notification:
  - `D:\XDOPP\planbook-ai\secrets\firebase-service-account.json`
- API key Gemini nếu muốn demo AI/OCR

## 2. Clone và chạy

```powershell
cd D:\XDOPP
git clone <repository-url> planbook-ai
cd planbook-ai
docker compose up -d --build
```

Kiểm tra trạng thái:

```powershell
docker compose ps
```

## 3. Database seed

Project đang dùng seed tại:

```text
db/02-master-seed.sql
```

File này chứa:

- tài khoản demo
- subject/chapter/topic môn Hóa
- dữ liệu nền cho nhiều service

## 4. URL truy cập

- Frontend: `http://localhost:3000`
- Gateway: `http://localhost:8080`
- Auth service: `http://localhost:8081`
- User service: `http://localhost:8082`
- Curriculum service: `http://localhost:8083`
- Question bank service: `http://localhost:8084`
- Exam service: `http://localhost:8085`
- AI service: `http://localhost:8086`
- Package service: `http://localhost:8087`

## 5. Tài khoản mặc định

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@planbook.ai | admin@123 |
| Manager | manager@gmail.com | admin@123 |
| Staff | staff@gmail.com | admin@123 |
| Teacher | teacher1@gmail.com | admin@123 |

## 6. Nếu một service không lên

Xem log:

```powershell
docker compose logs -f <service-name>
```

Ví dụ:

```powershell
docker compose logs -f curriculum-service
docker compose logs -f ai-service
docker compose logs -f package-service
```

## 7. Build local từng phần

Frontend:

```powershell
cd frontend
npm install
npm run build
```

Spring services:

```powershell
cd curriculum-service
mvn -DskipTests package
```

Làm tương tự cho `exam-service`, `question-bank-service`, `api-gateway`, `packageservice/packageservice`.

