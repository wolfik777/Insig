import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config'
import './FileUpload.css'

const FileUpload = ({ onUpload, loading }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [examples, setExamples] = useState([])
  const [showExamples, setShowExamples] = useState(false)
  const [filterFormat, setFilterFormat] = useState('all')
  const [filterBank, setFilterBank] = useState('all')

  useEffect(() => {
    // Загружаем список примеров
    fetch(API_ENDPOINTS.examples)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        if (data.success) {
          setExamples(data.examples || [])
          if (data.examples && data.examples.length === 0) {
            console.warn('Список примеров пуст')
          }
        } else {
          console.error('Ошибка от сервера:', data.error)
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки примеров:', err)
        console.error('URL:', API_ENDPOINTS.examples)
        // Не показываем ошибку в статусе, если это просто проблема с подключением
        // Индикатор BackendStatus покажет это
        if (err.message.includes('404')) {
          console.error('⚠️ Endpoint /api/examples не найден. Проверьте, что Backend запущен и прокси настроен правильно.')
        }
      })
  }, [])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file) => {
    setUploadStatus('Загрузка...')
    setDragActive(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(API_ENDPOINTS.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setUploadStatus(`✅ Загружено ${response.data.count} транзакций`)
        onUpload(response.data)
      } else {
        setUploadStatus('❌ Ошибка загрузки')
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
      setUploadStatus('❌ Ошибка: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleExampleLoad = async (examplePath) => {
    setUploadStatus('Загрузка примера...')
    try {
      const response = await axios.post(API_ENDPOINTS.loadExample, {
        file_path: examplePath
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        setUploadStatus(`✅ Загружено ${response.data.count} транзакций из примера`)
        onUpload(response.data)
        setShowExamples(false)
      } else {
        setUploadStatus('❌ Ошибка загрузки примера')
      }
    } catch (error) {
      console.error('Ошибка загрузки примера:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка'
      setUploadStatus(`❌ Ошибка: ${errorMessage}`)
      if (error.response?.status === 404) {
        setUploadStatus('❌ Файл примера не найден. Проверьте, что файлы примеров существуют в папке backend/examples/')
      }
    }
  }

  const handleLoadAllExamples = async () => {
    setUploadStatus('Загрузка всех примеров для тестирования...')
    try {
      const response = await axios.post(API_ENDPOINTS.loadAllExamples, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        setUploadStatus(`✅ Загружено ${response.data.count} транзакций из всех примеров`)
        onUpload(response.data)
        setShowExamples(false)
      } else {
        setUploadStatus('❌ Ошибка загрузки всех примеров')
      }
    } catch (error) {
      console.error('Ошибка загрузки всех примеров:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка'
      setUploadStatus(`❌ Ошибка: ${errorMessage}`)
    }
  }

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h3>Загрузите файл с транзакциями</h3>
          <p>Поддерживаемые форматы: CSV, Excel (XLSX), JSON, TXT</p>
          <label htmlFor="file-input" className="upload-button">
            Выбрать файл
          </label>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls,.json,.txt"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={loading}
          />
          {uploadStatus && (
            <p className={`upload-status ${uploadStatus.includes('✅') ? 'success' : 'error'}`}>
              {uploadStatus}
            </p>
          )}
        </div>
      </div>

      {/* Примеры банковских выписок */}
      <div className="examples-section">
        <button 
          className="examples-toggle"
          onClick={() => setShowExamples(!showExamples)}
        >
          {showExamples ? '▼' : '▶'} Загрузить пример банковской выписки
        </button>
        
        {showExamples && examples.length > 0 && (
          <div className="examples-list">
            <p className="examples-description">
              Выберите пример банковской выписки для тестирования:
            </p>
            
            {/* Фильтры */}
            <div className="examples-filters">
              <div className="filter-group">
                <label>Формат:</label>
                <select 
                  value={filterFormat} 
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Все форматы</option>
                  <option value="CSV">CSV</option>
                  <option value="TXT">TXT</option>
                  <option value="JSON">JSON</option>
                  <option value="XLSX">Excel</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Банк:</label>
                <select 
                  value={filterBank} 
                  onChange={(e) => setFilterBank(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Все банки</option>
                  {[...new Set(examples.map(e => e.bank))].map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Список примеров */}
            <div className="examples-grid">
              {examples
                .filter(example => 
                  (filterFormat === 'all' || example.format === filterFormat) &&
                  (filterBank === 'all' || example.bank === filterBank)
                )
                .map((example, idx) => (
                  <button
                    key={idx}
                    className="example-button"
                    onClick={() => handleExampleLoad(example.path)}
                    disabled={loading}
                  >
                    <span className="example-icon">🏦</span>
                    <div className="example-info">
                      <strong>{example.name}</strong>
                      <span className="example-bank">{example.bank}</span>
                      <span className="example-format">{example.format}</span>
                    </div>
                  </button>
                ))}
            </div>
            
            {examples.filter(example => 
              (filterFormat === 'all' || example.format === filterFormat) &&
              (filterBank === 'all' || example.bank === filterBank)
            ).length === 0 && (
              <p className="no-examples">Нет примеров с выбранными фильтрами</p>
            )}
            
            {/* Кнопка загрузки всех примеров для тестирования */}
            {examples.length > 0 && (
              <div className="load-all-section">
                <button
                  className="load-all-button"
                  onClick={() => handleLoadAllExamples()}
                  disabled={loading}
                >
                  🧪 Загрузить все примеры для тестирования паттернов
                </button>
                <p className="load-all-hint">
                  Загрузит все примеры сразу для полного тестирования всех паттернов покупок
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="file-format-info">
        <h4>Формат данных:</h4>
        <ul>
          <li><strong>Дата/Время</strong> - колонка с датой транзакции</li>
          <li><strong>Сумма</strong> - колонка с суммой покупки</li>
          <li><strong>Категория</strong> (опционально) - категория покупки</li>
          <li><strong>Описание</strong> (опционально) - описание транзакции</li>
        </ul>
        <p className="format-note">
          Приложение автоматически определит колонки по названиям (date, amount, category и т.д.)
        </p>
      </div>
    </div>
  )
}

export default FileUpload

