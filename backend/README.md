# Insight Backend API

Flask REST API для анализа транзакций и определения рискованных паттернов покупок.

## API Endpoints

### `GET /api/health`
Проверка работоспособности API

**Response:**
```json
{
  "status": "ok",
  "message": "Insight API is running"
}
```

### `POST /api/upload`
Загрузка файла с транзакциями

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (CSV, Excel, JSON, TXT)

**Response:**
```json
{
  "success": true,
  "transactions": [...],
  "analysis": {
    "risk_level": "high|medium|low",
    "risk_score": 5.2,
    "patterns": [...],
    "recommendations": [...]
  },
  "count": 10
}
```

### `POST /api/analyze`
Анализ транзакций

**Request:**
```json
{
  "transactions": [...]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {...}
}
```

### `POST /api/statistics`
Получение статистики

**Request:**
```json
{
  "transactions": [...]
}
```

**Response:**
```json
{
  "success": true,
  "hourly": {...},
  "daily": {...},
  "categories": {...}
}
```

## Алгоритм анализа риска

Приложение анализирует следующие факторы:

1. **Время суток:**
   - Ночь (22:00-6:00): +3 к риску
   - Поздний вечер (20:00-22:00): +2 к риску
   - Вечер (18:00-20:00): +1 к риску

2. **День недели:**
   - Пятница вечером: +2 к риску
   - Выходные вечером: +1 к риску

3. **Сумма покупки:**
   - Более 5000₽: +2 к риску
   - Более 2000₽: +1 к риску

**Уровни риска:**
- `low`: средний риск < 3
- `medium`: средний риск 3-5
- `high`: средний риск > 5

