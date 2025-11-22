import React, { useState } from 'react'
import './TransactionList.css'

const TransactionList = ({ transactions }) => {
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = ['all', ...new Set(transactions.map(t => t.category))]

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aVal, bVal

    switch (sortBy) {
      case 'date':
        aVal = new Date(a.date)
        bVal = new Date(b.date)
        break
      case 'amount':
        aVal = Math.abs(a.amount)
        bVal = Math.abs(b.amount)
        break
      case 'category':
        aVal = a.category
        bVal = b.category
        break
      default:
        return 0
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const filteredTransactions = filterCategory === 'all'
    ? sortedTransactions
    : sortedTransactions.filter(t => t.category === filterCategory)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount)
  }

  const getTimeBadge = (hour) => {
    if (hour >= 22 || hour <= 6) {
      return <span className="badge badge-night">🌙 Ночь</span>
    } else if (hour >= 18) {
      return <span className="badge badge-evening">🌆 Вечер</span>
    } else {
      return <span className="badge badge-day">☀️ День</span>
    }
  }

  return (
    <div className="transaction-list-container">
      <div className="transaction-list-header">
        <h2>📋 Список транзакций ({filteredTransactions.length})</h2>
        
        <div className="transaction-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="date">Сортировать по дате</option>
            <option value="amount">Сортировать по сумме</option>
            <option value="category">Сортировать по категории</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="control-button"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="control-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Все категории' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="transaction-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Нет транзакций для отображения</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-main">
                <div className="transaction-info">
                  <h3>{transaction.description}</h3>
                  <p className="transaction-date">{formatDate(transaction.date)}</p>
                  <p className="transaction-category">{transaction.category}</p>
                </div>
                <div className="transaction-amount">
                  <span className={`amount ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                    {formatAmount(transaction.amount)}
                  </span>
                  {getTimeBadge(transaction.hour)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TransactionList

