import React, { useState, useEffect } from 'react'
import './TrafficLight.css'

const TrafficLight = ({ riskLevel }) => {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (riskLevel === 'high') {
      // Мигание для высокого риска
      const interval = setInterval(() => {
        setIsBlinking((prev) => !prev)
      }, 500) // Мигание каждые 500мс

      return () => clearInterval(interval)
    } else {
      setIsBlinking(false)
    }
  }, [riskLevel])

  const getLightClass = () => {
    if (riskLevel === 'high') {
      return `traffic-light red ${isBlinking ? 'blinking' : ''}`
    } else if (riskLevel === 'medium') {
      return 'traffic-light yellow'
    } else {
      return 'traffic-light green'
    }
  }

  const getStatusText = () => {
    if (riskLevel === 'high') {
      return '⚠️ Высокий риск'
    } else if (riskLevel === 'medium') {
      return '⚡ Средний риск'
    } else {
      return '✅ Низкий риск'
    }
  }

  const getStatusDescription = () => {
    if (riskLevel === 'high') {
      return 'Риск импульсивных покупок высокий. Рекомендуется отложить крупные покупки.'
    } else if (riskLevel === 'medium') {
      return 'Умеренный риск. Будьте внимательны при совершении покупок.'
    } else {
      return 'Вы спокойны. Риск низкий.'
    }
  }

  return (
    <div className="traffic-light-container">
      <div className={getLightClass()}>
        <div className="light-glow"></div>
      </div>
      <div className="traffic-light-status">
        <h2>{getStatusText()}</h2>
        <p>{getStatusDescription()}</p>
      </div>
    </div>
  )
}

export default TrafficLight

