import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import './Statistics.css'

// Хук для определения размера экрана
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return isMobile
}

const Statistics = ({ transactions, analysis }) => {
  const isMobile = useIsMobile()
  // Статистика по часам
  const hourlyData = transactions.reduce((acc, t) => {
    const hour = t.hour
    if (!acc[hour]) {
      acc[hour] = { hour, count: 0, total: 0 }
    }
    acc[hour].count++
    acc[hour].total += Math.abs(t.amount)
    return acc
  }, {})

  const hourlyChartData = Object.values(hourlyData)
    .sort((a, b) => a.hour - b.hour)
    .map(item => ({
      hour: `${item.hour}:00`,
      'Количество покупок': item.count,
      'Сумма (₽)': Math.round(item.total)
    }))

  // Статистика по дням недели
  const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  const dailyData = transactions.reduce((acc, t) => {
    const day = dayNames[t.day_of_week]
    if (!acc[day]) {
      acc[day] = { day, count: 0, total: 0 }
    }
    acc[day].count++
    acc[day].total += Math.abs(t.amount)
    return acc
  }, {})

  const dailyChartData = dayNames
    .filter(day => dailyData[day])
    .map(day => ({
      day,
      'Количество': dailyData[day].count,
      'Сумма (₽)': Math.round(dailyData[day].total)
    }))

  // Статистика по категориям
  const categoryData = transactions.reduce((acc, t) => {
    const cat = t.category || 'Другое'
    if (!acc[cat]) {
      acc[cat] = { name: cat, value: 0, count: 0 }
    }
    acc[cat].value += Math.abs(t.amount)
    acc[cat].count++
    return acc
  }, {})

  const categoryChartData = Object.values(categoryData)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea']

  // Общая статистика
  const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const avgAmount = totalAmount / transactions.length
  const nightPurchases = transactions.filter(t => t.hour >= 22 || t.hour <= 6).length
  const eveningPurchases = transactions.filter(t => t.hour >= 18).length

  return (
    <div className="statistics-container">
      <h2>📊 Статистика и аналитика</h2>

      {/* Общая статистика */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Общая сумма</h3>
            <p className="stat-value">{new Intl.NumberFormat('ru-RU').format(Math.round(totalAmount))} ₽</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Средняя покупка</h3>
            <p className="stat-value">{new Intl.NumberFormat('ru-RU').format(Math.round(avgAmount))} ₽</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌙</div>
          <div className="stat-content">
            <h3>Ночные покупки</h3>
            <p className="stat-value">{nightPurchases}</p>
            <p className="stat-percent">{Math.round(nightPurchases / transactions.length * 100)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌆</div>
          <div className="stat-content">
            <h3>Вечерние покупки</h3>
            <p className="stat-value">{eveningPurchases}</p>
            <p className="stat-percent">{Math.round(eveningPurchases / transactions.length * 100)}%</p>
          </div>
        </div>
      </div>

      {/* График по часам */}
      <div className="chart-section">
        <h3>Покупки по времени суток</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <BarChart data={hourlyChartData} margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 10 } : { top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" angle={isMobile ? -45 : 0} textAnchor={isMobile ? "end" : "middle"} height={isMobile ? 60 : 30} fontSize={isMobile ? 10 : 12} />
            <YAxis yAxisId="left" fontSize={isMobile ? 10 : 12} />
            <YAxis yAxisId="right" orientation="right" fontSize={isMobile ? 10 : 12} />
            <Tooltip contentStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
            <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '12px' }} />
            <Bar yAxisId="left" dataKey="Количество покупок" fill="#667eea" />
            <Bar yAxisId="right" dataKey="Сумма (₽)" fill="#764ba2" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* График по дням недели */}
      <div className="chart-section">
        <h3>Покупки по дням недели</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <BarChart data={dailyChartData} margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 10 } : { top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" angle={isMobile ? -45 : 0} textAnchor={isMobile ? "end" : "middle"} height={isMobile ? 60 : 30} fontSize={isMobile ? 10 : 12} />
            <YAxis yAxisId="left" fontSize={isMobile ? 10 : 12} />
            <YAxis yAxisId="right" orientation="right" fontSize={isMobile ? 10 : 12} />
            <Tooltip contentStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
            <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '12px' }} />
            <Bar yAxisId="left" dataKey="Количество" fill="#4facfe" />
            <Bar yAxisId="right" dataKey="Сумма (₽)" fill="#00f2fe" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* График по категориям */}
      {categoryChartData.length > 0 && (
        <div className="chart-section">
          <h3>Расходы по категориям</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={isMobile ? ({ percent }) => `${(percent * 100).toFixed(0)}%` : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={isMobile ? 80 : 120}
                fill="#8884d8"
                dataKey="value"
                fontSize={isMobile ? 10 : 12}
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Math.round(value)} ₽`} contentStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Паттерны риска */}
      {analysis && analysis.patterns && analysis.patterns.length > 0 && (
        <div className="patterns-section">
          <h3>🔍 Обнаруженные паттерны</h3>
          <div className="patterns-list">
            {analysis.patterns.map((pattern, idx) => (
              <div key={idx} className="pattern-item">
                <h4>{pattern.description}</h4>
                <p>Количество: {pattern.count}</p>
                {pattern.percentage && <p>Процент: {pattern.percentage}%</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Statistics

