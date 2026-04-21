# =====================================================================
# Dockerfile cho ai_service (FastAPI + Python)
#
# Cấu trúc import: from ai_service.app.xxx
# → Cần cài toàn bộ ai_service như 1 Python package
# =====================================================================

FROM python:3.11-slim

# Tránh Python tạo file .pyc và đảm bảo log in real-time trong Docker
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /workspace

# Cài dependencies trước (cache layer nếu requirements.txt không đổi)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ thư mục ai_service vào /workspace/ai_service
# Giữ nguyên cấu trúc để import "from ai_service.app.xxx" hoạt động
COPY . ./ai_service

# Copy alembic.ini ra ngoài để chạy migration từ /workspace
COPY alembic.ini ./alembic.ini

# Expose port 8086 (theo config.py)
EXPOSE 8086

# Chạy migration trước rồi mới start server
# Dùng sh -c để chạy 2 lệnh tuần tự
CMD ["sh", "-c", "alembic upgrade head && uvicorn ai_service.app.main:app --host 0.0.0.0 --port 8086"]
