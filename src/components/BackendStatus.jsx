import React, { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'
import './BackendStatus.css'

const BackendStatus = () => {
  const [status, setStatus] = useState('checking')
  const [port, setPort] = useState(null)

  useEffect(() => {
    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 5000) // Проверка каждые 5 секунд
    return () => clearInterval(interval)
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.health)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      if (data.status === 'ok') {
        setStatus('connected')
        setPort(data.port || '5000')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Ошибка подключения к Backend:', error)
      console.error('API_ENDPOINTS.health:', API_ENDPOINTS.health)
      setStatus('error')
      setPort(null)
    }
  }

  if (status === 'checking') {
    return (
      <div className="backend-status checking">
        <span className="status-icon">⏳</span>
        <span>Проверка подключения к серверу...</span>
      </div>
    )
  }

  if (status === 'error') {
    const isProduction = import.meta.env.PROD
    const apiUrl = API_ENDPOINTS.health
    
    return (
      <div className="backend-status error">
        <span className="status-icon">❌</span>
        <div className="status-content">
          <strong>Не удалось подключиться к Backend</strong>
          {isProduction ? (
            <>
              <p>Проверьте настройки в Vercel:</p>
              <p className="status-hint">
                1. Переменная окружения <code>VITE_API_URL</code> должна быть: <code>https://web-production-3f480.up.railway.app/api</code>
              </p>
              <p className="status-hint">
                2. После изменения переменной окружения нужно передеплоить проект
              </p>
              <p className="status-hint">
                3. Проверьте что Backend работает: <a href="https://web-production-3f480.up.railway.app/api/health" target="_blank" rel="noopener noreferrer">https://web-production-3f480.up.railway.app/api/health</a>
              </p>
              <p className="status-hint" style={{fontSize: '0.85em', color: '#666'}}>
                Текущий API URL: {apiUrl}
              </p>
            </>
          ) : (
            <>
              <p>Убедитесь, что Backend запущен (порт 5000 или 5001)</p>
              <p className="status-hint">
                Запустите: <code>cd backend && python app.py</code>
              </p>
              <p className="status-hint">
                Если Backend на другом порту, обновите vite.config.js
              </p>
              <p className="status-hint" style={{fontSize: '0.85em', color: '#666'}}>
                Текущий API URL: {apiUrl}
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="backend-status connected">
      <span className="status-icon">✅</span>
      <span>Подключено к Backend{port ? ` (порт ${port})` : ''}</span>
    </div>
  )
}

export default BackendStatus

