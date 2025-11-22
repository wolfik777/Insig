# 🚀 Настройка для Vercel

## ✅ Frontend на Vercel

Vercel автоматически определит Vite и соберет Frontend. Просто:

1. Подключите GitHub репозиторий к Vercel
2. Vercel автоматически:
   - Определит Vite
   - Установит зависимости
   - Соберет проект (`npm run build`)
   - Задеплоит Frontend

✅ Frontend будет доступен по адресу: `https://insight.vercel.app`

---

## 🔧 Backend отдельно (обязательно!)

Vercel не поддерживает долгоживущие Python процессы. Backend нужно деплоить отдельно.

### Вариант 1: Railway (Рекомендуется) ⭐

1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Выберите репозиторий `insight`
5. Railway автоматически запустит Backend

✅ Backend будет доступен по адресу: `https://your-app.railway.app`

### Вариант 2: Heroku

1. Установите Heroku CLI
2. Войдите: `heroku login`
3. Создайте приложение: `heroku create insight-backend`
4. Загрузите: `git push heroku main`

✅ Backend будет доступен по адресу: `https://insight-backend.herokuapp.com`

---

## 🔗 Связывание Frontend и Backend

### Шаг 1: Получите URL Backend

После деплоя Backend на Railway/Heroku, скопируйте URL:
- Railway: `https://your-app.railway.app`
- Heroku: `https://insight-backend.herokuapp.com`

### Шаг 2: Настройте переменные окружения в Vercel

1. Откройте проект на Vercel
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.railway.app/api` (или Heroku URL)
4. Нажмите **Save**

### Шаг 3: Обновите `src/config.js`

Файл уже настроен для использования переменной окружения:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
```

### Шаг 4: Передеплойте Frontend

После добавления переменной окружения:
1. В Vercel нажмите **Redeploy**
2. Или сделайте новый commit и push

---

## ✅ Проверка

1. **Frontend:** `https://insight.vercel.app`
2. **Backend:** `https://your-backend-url.railway.app/api/health`

Оба должны работать!

---

## 🐛 Если не работает

### Проблема: CORS ошибки

Добавьте в `backend/app.py` (уже есть, но проверьте):

```python
CORS(app, resources={r"/api/*": {"origins": ["https://insight.vercel.app", "http://localhost:3000"]}})
```

### Проблема: Frontend не подключается к Backend

1. Проверьте переменную окружения `VITE_API_URL` в Vercel
2. Убедитесь, что Backend запущен и доступен
3. Проверьте CORS настройки в Backend

---

## 📝 Структура

```
Frontend (Vercel) → https://insight.vercel.app
         ↓
    API запросы
         ↓
Backend (Railway/Heroku) → https://your-backend.railway.app/api
```

---

## 🎯 Быстрая команда для обновления

```bash
# Обновить код
git add .
git commit -m "Update for Vercel"
git push

# Vercel автоматически передеплоит Frontend
# Railway/Heroku автоматически передеплоит Backend
```

Готово! 🎉

