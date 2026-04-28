# Deployment Guide

## 1. Khuyến nghị triển khai

Với kiến trúc hiện tại, cách triển khai phù hợp nhất là một VPS/VM chạy Docker Compose.

Lý do:

- Project có nhiều service Java, Python, MySQL, Redis và frontend.
- Các nền tảng free dạng serverless/web service không phù hợp để chạy nguyên stack microservices.
- Docker Compose giúp môi trường production gần giống local demo.

## 2. Cấu hình tối thiểu

| Mục | Demo ngắn | Khuyến nghị |
| --- | --- | --- |
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB trở lên |
| Disk | 30 GB | 50 GB trở lên |
| OS | Ubuntu 22.04/24.04 | Ubuntu 22.04/24.04 |

Nếu dùng Oracle Cloud Always Free Ampere A1, nên cấp tối đa tài nguyên Always Free có thể dùng cho VM.

## 3. Các bước triển khai VPS

### 3.1 Cài Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
```

### 3.2 Upload source

```bash
git clone <repository-url> planbook-ai
cd planbook-ai
```

### 3.3 Cấu hình biến môi trường

Tạo/cập nhật `.env`:

```env
GEMINI_API_KEY=<your-gemini-key>
MYSQL_ROOT_PASSWORD=<strong-password>
```

Nếu demo Firebase notification:

```text
secrets/firebase-service-account.json
```

### 3.4 Chạy hệ thống

```bash
docker compose up -d --build
docker compose ps
```

### 3.5 Reverse proxy domain

Nên dùng Nginx/Caddy trỏ domain vào frontend hoặc gateway.

Ví dụ với Nginx frontend:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Gateway API vẫn chạy ở `:8080`. Khi đưa production thật, frontend nên lấy API base URL qua biến môi trường thay vì hard-code `localhost`.

## 4. Free hosting

### Cloudflare Tunnel

Phù hợp demo ngắn:

- chạy hệ thống trên máy cá nhân
- dùng tunnel public URL
- máy tắt là hệ thống tắt

### Oracle Cloud Always Free

Phù hợp host lâu hơn nếu đăng ký được VM:

- có thể chạy Docker Compose
- cần tự quản Linux/Docker/firewall

### Render/Vercel/Railway free

Không khuyến nghị cho full stack hiện tại:

- nhiều service
- Java service tốn RAM
- cần MySQL/Redis
- free tier dễ sleep hoặc giới hạn tài nguyên

## 5. Checklist trước ngày demo

1. `docker compose ps` tất cả service chính `Up`.
2. Login đủ 4 role.
3. Admin có template ACTIVE.
4. Staff tạo được giáo án mẫu.
5. Manager duyệt được.
6. Teacher tạo giáo án và đề thi được.
7. Có ít nhất một câu hỏi APPROVED để tạo đề thi.
8. Chuẩn bị sẵn ảnh OCR mẫu.
9. Test export PDF/Word/CSV.

