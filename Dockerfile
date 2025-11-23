FROM python:3.9-slim

WORKDIR /app

# Копируем requirements и устанавливаем зависимости
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь backend
COPY backend/ ./backend/

# Устанавливаем рабочую директорию в backend
WORKDIR /app/backend

# Открываем порт
EXPOSE 5000

# Переменная окружения для порта (Railway/Heroku)
ENV PORT=5000

# Запускаем приложение
CMD ["python", "app.py"]

