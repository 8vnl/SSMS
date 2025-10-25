import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SalesReport = () => {
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
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

    setDateRange({
      startDate: oneWeekAgoStr,
      endDate: today
    });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchDailyAggregates();
    }
  }, [dateRange]);

  const fetchDailyAggregates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales/aggregates', {
        params: dateRange
      });
      setDailyAggregates(response.data);
    } catch (error) {
      setError('Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDateDetails = async (date) => {
    try {
      const response = await api.get('/sales/history', {
        params: {
          startDate: date,
          endDate: date
        }
      });
      setDateDetails(response.data);
      setSelectedDate(date);
    } catch (error) {
      setError('Failed to fetch date details');
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
      <h2>Past Sales Report</h2>

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
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading report...</div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Sales</th>
                  <th>Number of Transactions</th>
                  <th>Average per Transaction</th>
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
                      {day.transactionCount > 0 
                        ? formatCurrency(day.totalSales / day.transactionCount)
                        : formatCurrency(0)
                      }
                    </td>
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
        </>
      )}
    </div>
  );
};

export default SalesReport;