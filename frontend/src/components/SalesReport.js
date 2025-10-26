import React, { useState, useEffect } from 'react';
import { publicApi } from '../services/api';

const SalesReport = ({ isGuest = false }) => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [dailyAggregates, setDailyAggregates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateDetails, setDateDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set default date range to last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setDateRange({
      startDate: startStr,
      endDate: endStr
    });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchDailyAggregates();
    }
  }, [dateRange]);

  const fetchDailyAggregates = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (isGuest) {
        response = await publicApi.get('/aggregates', {
          params: dateRange
        });
      } else {
        const api = await import('../services/api');
        response = await api.default.get('/sales/aggregates', {
          params: dateRange
        });
      }
      setDailyAggregates(response.data);
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
      setError('Failed to fetch sales data: ' + (error.message || 'Please check your connection'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDateDetails = async (date) => {
    try {
      let response;
      if (isGuest) {
        response = await publicApi.get('/history', {
          params: {
            startDate: date,
            endDate: date
          }
        });
      } else {
        const api = await import('../services/api');
        response = await api.default.get('/sales/history', {
          params: {
            startDate: date,
            endDate: date
          }
        });
      }
      setDateDetails(response.data);
      setSelectedDate(date);
    } catch (error) {
      console.error('Failed to fetch date details:', error);
      setError('Failed to fetch date details: ' + (error.message || 'Please check your connection'));
    }
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="sales-report">
      <h2>Sales Reports {isGuest && <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>(Guest View)</span>}</h2>

      {isGuest && (
        <div className="alert alert-info">
          <p><strong>Read-Only Access</strong></p>
          <p>You are viewing reports in guest mode. Login for full access to all features.</p>
        </div>
      )}

      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateRangeChange}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateRangeChange}
          />
        </div>
        
        <button 
          type="button" 
          className="btn"
          onClick={fetchDailyAggregates}
          style={{ marginTop: '1rem' }}
        >
          Refresh Data
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading report...</div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p>Showing data from <strong>{dateRange.startDate}</strong> to <strong>{dateRange.endDate}</strong></p>
            <p>Found <strong>{dailyAggregates.length}</strong> days with sales data</p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Sales</th>
                  <th>Number of Transactions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailyAggregates.map(day => (
                  <tr key={day.date}>
                    <td>{formatDate(day.date)}</td>
                    <td>{formatCurrency(day.totalSales)}</td>
                    <td>{day.transactionCount}</td>
                    <td>
                      <button 
                        className="btn"
                        onClick={() => fetchDateDetails(day.date)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {dailyAggregates.length === 0 && !loading && (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              No sales data found for the selected date range.
            </p>
          )}

          {selectedDate && dateDetails.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h3>Transaction Details for {formatDate(selectedDate)}</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Buyer/Table</th>
                      <th>Items</th>
                      <th>Custom Charges</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateDetails.map(sale => (
                      <tr key={sale.id}>
                        <td>{new Date(sale.createdAt).toLocaleTimeString('id-ID')}</td>
                        <td>{sale.buyerIdentifier}</td>
                        <td>
                          {sale.orderItems.map((item, index) => (
                            <div key={index}>
                              {item.quantity}x {item.menuItem?.name || 'Unknown Item'}
                              {item.selectedOption && ` (${item.selectedOption})`}
                            </div>
                          ))}
                        </td>
                        <td>
                          {sale.customAdditionalCharges > 0 && (
                            <>
                              {formatCurrency(sale.customAdditionalCharges)}
                              {sale.additionalChargeNotes && (
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {sale.additionalChargeNotes}
                                </div>
                              )}
                            </>
                          )}
                        </td>
                        <td>{formatCurrency(sale.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedDate && dateDetails.length === 0 && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p>No transaction details found for {formatDate(selectedDate)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesReport;
