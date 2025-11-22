import React, { useState, useEffect } from 'react'
import TrafficLight from './components/TrafficLight'
import TransactionList from './components/TransactionList'
import FileUpload from './components/FileUpload'
import Statistics from './components/Statistics'
import BackendStatus from './components/BackendStatus'
import { API_ENDPOINTS } from './config'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (fileData) => {
    setTransactions(fileData.transactions || [])
    setAnalysis(fileData.analysis || null)
  }

  const handleAnalyze = async (newTransactions) => {
    if (!newTransactions || newTransactions.length === 0) return

    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.analyze, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: newTransactions }),
      })

      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Ошибка анализа:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (transactions.length > 0) {
      handleAnalyze(transactions)
    }
  }, [transactions])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Insight</h1>
        <p>Анализ импульсивных покупок</p>
      </header>

      <main className="app-main">
        <div className="main-content">
          {/* Статус подключения к Backend */}
          <BackendStatus />
          
          {/* Виджет светофора */}
          <div className="traffic-light-section">
            <TrafficLight riskLevel={analysis?.risk_level || 'low'} />
            {analysis && (
              <div className="risk-info">
                <p className="risk-score">Уровень риска: {analysis.risk_score}/10</p>
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="recommendations">
                    {analysis.recommendations.map((rec, idx) => (
                      <p key={idx} className="recommendation">💡 {rec}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Загрузка файлов */}
          <FileUpload onUpload={handleFileUpload} loading={loading} />

          {/* Статистика и графики */}
          {transactions.length > 0 && (
            <>
              <Statistics transactions={transactions} analysis={analysis} />
              <TransactionList transactions={transactions} />
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Insight © 2025 | Анализ ваших покупок</p>
      </footer>
    </div>
  )
}

export default App

