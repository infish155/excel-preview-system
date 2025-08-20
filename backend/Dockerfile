FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app/app

# 生产环境启动命令，开发时由docker-compose 覆盖
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0", "--port", "8000", "--reload"]