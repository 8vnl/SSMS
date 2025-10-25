import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [todayData, setTodayData] = useState({
    sales: [],
    summary: { totalSales: 0, transactionCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      const response = await api.get('/sales/today');
      setTodayData(response.data);
    } catch (error) {
      setError('Failed to fetch today\'s data');
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

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Today's Sales Dashboard</h2>
        <Link to="/sales" className="btn btn-success">
          New Sale
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales Today</h3>
          <div className="value">
            {formatCurrency(todayData.summary.totalSales)}
          </div>
        </div>

        <div className="stat-card">
          <h3>Number of Transactions</h3>
          <div className="value">
            {todayData.summary.transactionCount}
          </div>
        </div>

        <div className="stat-card">
          <h3>Average per Transaction</h3>
          <div className="value">
            {todayData.summary.transactionCount > 0 
              ? formatCurrency(todayData.summary.totalSales / todayData.summary.transactionCount)
              : formatCurrency(0)
            }
          </div>
        </div>
      </div>

      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        {todayData.sales.length === 0 ? (
          <p>No transactions today</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Buyer/Table</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {todayData.sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>{new Date(sale.createdAt).toLocaleTimeString()}</td>
                    <td>{sale.buyerIdentifier}</td>
                    <td>
                      {sale.orderItems.map((item, index) => (
                        <div key={index}>
                          {item.quantity}x {item.menuItem.name}
                          {item.selectedOption && ` (${item.selectedOption})`}
                        </div>
                      ))}
                    </td>
                    <td>{formatCurrency(sale.totalPrice)}</td>
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