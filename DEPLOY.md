# 🚀 Руководство по деплою Insight

## Варианты деплоя

### 1. Frontend + Backend на одном сервере

#### Использование VPS (DigitalOcean, AWS, и т.д.)

1. **Установите зависимости:**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python
sudo apt-get install python3 python3-pip
```

2. **Клонируйте репозиторий:**
```bash
git clone <your-repo-url>
cd Insight
```

3. **Настройте Backend:**
```bash
cd backend
pip3 install -r requirements.txt
pip3 install gunicorn
```

4. **Настройте Frontend:**
```bash
npm install
npm run build
```

5. **Запустите Backend:**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

6. **Настройте Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/Insight/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Отдельный деплой Frontend и Backend

#### Frontend на Vercel/Netlify

1. **Vercel:**
```bash
npm install -g vercel
vercel
```

2. **Netlify:**
- Подключите GitHub репозиторий
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_API_URL=https://your-backend-url.com/api`

#### Backend на Heroku

1. **Создайте Procfile:**
```
web: cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT app:app
```

2. **Деплой:**
```bash
heroku create insight-backend
git push heroku main
```

### 3. Docker

**Dockerfile для Backend:**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

**Dockerfile для Frontend:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend/data:/app/data

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Переменные окружения

### Backend (.env)
```
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_PORT=5000
SECRET_KEY=your-secret-key
```

### Frontend
```
VITE_API_URL=https://your-backend-url.com/api
```

## SSL/HTTPS

Используйте Let's Encrypt для бесплатного SSL:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Мониторинг

Рекомендуется использовать:
- **PM2** для управления процессами Node.js
- **Supervisor** для управления процессами Python
- **Nginx** как reverse proxy

## Готово! 🎉

После деплоя ваше приложение будет доступно по адресу вашего домена.

