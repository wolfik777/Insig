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
      const data = await response.json()
      if (data.status === 'ok') {
        setStatus('connected')
        setPort(data.port || '5000')
      } else {
        setStatus('error')
      }
    } catch (error) {
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
    return (
      <div className="backend-status error">
        <span className="status-icon">❌</span>
        <div className="status-content">
          <strong>Не удалось подключиться к Backend</strong>
          <p>Убедитесь, что Backend запущен (порт 5000 или 5001)</p>
          <p className="status-hint">
            Запустите: <code>cd backend && python app.py</code>
          </p>
          <p className="status-hint">
            Если Backend на другом порту, обновите vite.config.js
          </p>
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

