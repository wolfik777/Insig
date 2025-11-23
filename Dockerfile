FROM python:3.9-slim

WORKDIR /app

# Копируем requirements и устанавливаем зависимости
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Копируем весь backend
COPY backend/ ./backend/

# Копируем примеры (важно для работы приложения)
COPY backend/examples/ ./backend/examples/
COPY backend/example_transactions.csv ./backend/

# Рабочая директория - корень проекта
# (команда запуска: python backend/app.py)
WORKDIR /app

# Открываем порт (Railway/Heroku используют переменную PORT)
EXPOSE 5000

# Переменная окружения для порта (Railway/Heroku автоматически установят PORT)
ENV PORT=5000
ENV FLASK_ENV=production

# Запускаем приложение из корня проекта
# Railway/Heroku установят переменную PORT автоматически
CMD ["python", "backend/app.py"]

