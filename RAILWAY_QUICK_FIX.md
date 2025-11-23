# ⚡ Быстрое исправление Railway

## ❌ Ошибка: "Failed to build an image"

## ✅ Решение (2 минуты):

### В Railway Dashboard:

1. Откройте проект на Railway
2. **Settings** → **Service**
3. Установите:
   ```
   Root Directory: ./
   Start Command: cd backend && python app.py
   Build Command: (оставьте ПУСТЫМ)
   ```
4. Нажмите **"Save"**
5. Нажмите **"Redeploy"**

---

## 🔍 Если не помогло:

### Вариант 1: Использовать Dockerfile

1. В Railway Settings → Service
2. **Builder:** выберите **"Dockerfile"**
3. **Redeploy**

### Вариант 2: Проверить логи

1. Railway → **Deployments** → последний деплой
2. Откройте **Build Logs**
3. Посмотрите точную ошибку

---

## ✅ Альтернатива: Heroku

Если Railway не работает:

```bash
heroku login
heroku create insight-backend
git push heroku main
```

Heroku использует `Procfile` - уже настроен!

---

**Файлы созданы:**
- ✅ `nixpacks.toml` - для Railway
- ✅ `Dockerfile` - альтернатива
- ✅ `Procfile` - для Heroku

