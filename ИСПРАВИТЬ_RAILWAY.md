# 🔧 Исправление ошибки Railway

## ❌ Ошибка: "Failed to build an image"

## ✅ Решение (3 шага):

### Шаг 1: В Railway Settings

1. Откройте ваш проект на Railway
2. Перейдите в **Settings** → **Service**
3. Установите:
   - **Root Directory:** `./` (корень проекта)
   - **Start Command:** `cd backend && python app.py`
   - **Build Command:** оставьте **ПУСТЫМ**

### Шаг 2: Проверьте файлы

Убедитесь что есть:
- ✅ `backend/app.py`
- ✅ `backend/requirements.txt`
- ✅ `nixpacks.toml` (в корне проекта)
- ✅ `Dockerfile` (в корне проекта) - альтернатива

### Шаг 3: Передеплой

1. В Railway нажмите **"Redeploy"**
2. Или сделайте новый commit:
```bash
git add .
git commit -m "Fix Railway deployment"
git push
```

---

## 🔍 Если все еще не работает

### Вариант A: Использовать Dockerfile

1. В Railway Settings → Service
2. **Builder:** выберите **"Dockerfile"**
3. Railway будет использовать `Dockerfile` (уже создан)

### Вариант B: Проверить логи

1. В Railway → **Deployments**
2. Откройте последний деплой
3. Посмотрите **Build Logs**
4. Там будет точная ошибка

---

## 🎯 Быстрое решение

**В Railway Settings → Service установите:**

```
Root Directory: ./
Start Command: cd backend && python app.py
Build Command: (оставьте пустым)
```

Затем нажмите **"Redeploy"**

---

## ✅ Альтернатива: Heroku

Если Railway не работает, используйте Heroku:

1. `heroku login`
2. `heroku create insight-backend`
3. `git push heroku main`

Heroku использует `Procfile` который уже настроен.

---

Подробнее: [RAILWAY_FIX.md](RAILWAY_FIX.md)

