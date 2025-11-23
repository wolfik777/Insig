/**
 * Конфигурация API
 * Использует переменную окружения VITE_API_URL для production (Vercel)
 * Или относительные пути для локальной разработки через Vite proxy
 */

// Базовый URL API
// На Vercel: использует VITE_API_URL (например: https://web-production-3f480.up.railway.app/api)
// Локально: использует /api (проксируется через vite.config.js)
let API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Убеждаемся что URL начинается с https:// если это не относительный путь
if (API_BASE_URL && !API_BASE_URL.startsWith('/') && !API_BASE_URL.startsWith('http')) {
  // Если URL без протокола, добавляем https://
  API_BASE_URL = `https://${API_BASE_URL}`
}

// Логируем для отладки
console.log('API_BASE_URL:', API_BASE_URL)
console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL)

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  upload: `${API_BASE_URL}/upload`,
  analyze: `${API_BASE_URL}/analyze`,
  statistics: `${API_BASE_URL}/statistics`,
  examples: `${API_BASE_URL}/examples`,
  loadExample: `${API_BASE_URL}/load-example`,
  loadAllExamples: `${API_BASE_URL}/load-all-examples`,
}

export default API_BASE_URL

