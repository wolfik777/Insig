// PM2 конфигурация для автоматического запуска и управления процессами
module.exports = {
  apps: [{
    name: 'insight-backend',
    script: 'backend/app.py',
    interpreter: 'python3',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      FLASK_ENV: 'production',
      FLASK_PORT: 5000,
      PORT: 5000
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}

