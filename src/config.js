/**
 * Конфигурация API
 * Использует относительные пути для работы через Vite proxy
 */

// Базовый URL API (используется прокси из vite.config.js)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

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

