import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../services/api';

const Dashboard = ({ isGuest = false }) => {
  const [todayData, setTodayData] = useState({
    sales: [],
    summary: { totalSales: 0, transactionCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayData();
    const interval = setInterval(fetchTodayData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayData = async () => {
    try {
      let response;
      if (isGuest) {
        // Use public API for guest mode
        response = await publicApi.get('/today');
      } else {
        // Use authenticated API for logged-in users
        const api = await import('../services/api');
        response = await api.default.get('/sales/today');
      }
      setTodayData(response.data);
    } catch (error) {
      console.error('Failed to fetch today\'s data:', error);
      setError('Failed to fetch today\'s data: ' + (error.message || 'Please check your connection'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Today's Overview</h2>
          {isGuest && (
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              👀 Guest Mode - View Only
            </p>
          )}
        </div>
        {!isGuest && (
          <Link to="/sales" className="btn btn-success">
            ➕ New Sale
          </Link>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {isGuest && (
        <div className="alert alert-info">
          <p><strong>Guest Mode</strong></p>
          <p>You are viewing data in read-only mode. To create sales and access all features, please login.</p>
          <Link to="/login" className="btn btn-success mt-1">
            🔐 Login to Full Access
          </Link>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <div className="value currency">
            {formatCurrency(todayData.summary.totalSales)}
          </div>
        </div>

        <div className="stat-card">
          <h3>Transactions</h3>
          <div className="value">
            {todayData.summary.transactionCount}
          </div>
        </div>
      </div>

      <div className="recent-transactions">
        <h3 className="mb-2">Recent Transactions</h3>
        {todayData.sales.length === 0 ? (
          <div className="alert alert-info">
            <p>No transactions today yet.</p>
            {!isGuest && (
              <Link to="/sales" className="btn btn-success mt-1">
                Create First Sale
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container">
            <div className="mobile-table">
              {todayData.sales.map((sale) => (
                <div key={sale.id} className="mobile-table-row">
                  <div className="mobile-table-header">
                    <span className="time">{formatTime(sale.createdAt)}</span>
                    <span className="customer">{sale.buyerIdentifier}</span>
                    <span className="total currency">{formatCurrency(sale.totalPrice)}</span>
                  </div>
                  <div className="mobile-table-items">
                    {sale.orderItems.map((item, index) => (
                      <div key={index} className="item">
                        <span className="quantity">{item.quantity}x</span>
                        <span className="name">{item.menuItem.name}</span>
                        {item.selectedOption && (
                          <span className="option">({item.selectedOption})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fallback desktop table */}
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {todayData.sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{formatTime(sale.createdAt)}</td>
                    <td>
                      <strong>{sale.buyerIdentifier}</strong>
                    </td>
                    <td>
                      {sale.orderItems.slice(0, 2).map((item, index) => (
                        <div key={index} style={{ fontSize: '0.85rem' }}>
                          {item.quantity}x {item.menuItem.name}
                          {item.selectedOption && ` (${item.selectedOption})`}
                        </div>
                      ))}
                      {sale.orderItems.length > 2 && (
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          +{sale.orderItems.length - 2} more items
                        </div>
                      )}
                    </td>
                    <td className="currency">
                      <strong>{formatCurrency(sale.totalPrice)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
