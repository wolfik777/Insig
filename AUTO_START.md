# 🚀 Автоматический запуск сервера

## Вариант 1: Heroku (Самый простой) ⭐

### Настройка:

1. **Procfile уже создан** - он автоматически запустит Backend

2. **Деплой на Heroku:**
```bash
# Установите Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Войдите
heroku login

# Создайте приложение
heroku create insight-backend

# Загрузите код
git push heroku main
```

✅ **Готово!** Сервер запустится автоматически и будет доступен по адресу: `https://insight-backend.herokuapp.com`

---

## Вариант 2: Railway (Бесплатно, просто)

1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project" → "Deploy from GitHub repo"
4. Выберите репозиторий `insight`
5. Railway автоматически определит Python и запустит Backend

✅ **Готово!** Сервер запустится автоматически

---

## Вариант 3: VPS с PM2 (Рекомендуется для продакшена)

### Установка PM2:
```bash
npm install -g pm2
```

### Запуск:
```bash
# Запустить Backend
pm2 start ecosystem.config.js

# Автоматический запуск при перезагрузке
pm2 startup
pm2 save
```

### Управление:
```bash
pm2 status      # Статус
pm2 logs        # Логи
pm2 restart insight-backend  # Перезапуск
pm2 stop insight-backend     # Остановка
```

---

## Вариант 4: VPS с systemd (Linux)

### Установка:

1. **Скопируйте файл `insight.service`:**
```bash
sudo cp insight.service /etc/systemd/system/
```

2. **Отредактируйте пути:**
```bash
sudo nano /etc/systemd/system/insight.service
```
Измените:
- `WorkingDirectory=/path/to/Insight/backend` → ваш путь
- `ExecStart=/usr/bin/python3 /path/to/Insight/backend/app.py` → ваш путь

3. **Запустите:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable insight
sudo systemctl start insight
```

4. **Проверка:**
```bash
sudo systemctl status insight
```

---

## Вариант 5: Docker (Универсально)

### Создайте Dockerfile для Backend:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 5000

CMD ["python", "app.py"]
```

### Запуск:
```bash
docker build -t insight-backend .
docker run -d -p 5000:5000 --name insight insight-backend
```

### Автозапуск:
```bash
docker run -d -p 5000:5000 --restart=always --name insight insight-backend
```

---

## Вариант 6: GitHub Actions (Автоматический деплой)

Файл `.github/workflows/deploy.yml` уже создан. Он автоматически:
- Проверяет код при каждом push
- Собирает Frontend
- Можно настроить автоматический деплой

---

## 🔧 Настройка порта

Если Backend запускается на другом порту, обновите:

### 1. `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:ВАШ_ПОРТ',  // Измените порт
    changeOrigin: true
  }
}
```

### 2. Переменные окружения:
```bash
# Windows
set FLASK_PORT=5000

# Linux/Mac
export FLASK_PORT=5000
```

---

## ✅ Проверка что сервер запущен

```bash
# Проверка локально
curl http://localhost:5000/api/health

# Или откройте в браузере
http://localhost:5000/api/health
```

Должен вернуться:
```json
{"status": "ok", "message": "Insight API is running"}
```

---

## 🎯 Рекомендация

**Для быстрого старта:** Используйте **Railway** или **Heroku** - они автоматически запустят сервер.

**Для продакшена:** Используйте **PM2** на VPS - это даст больше контроля.

