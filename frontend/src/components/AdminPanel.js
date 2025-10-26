import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [salesRecords, setSalesRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingUsers();
    fetchAllUsers();
    if (activeTab === 'sales') {
      fetchSalesRecords();
    }
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/users/pending');
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      setError('Failed to fetch pending users');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users');
    }
  };

  const fetchSalesRecords = async () => {
    try {
      const response = await api.get('/sales/history?startDate=2020-01-01&endDate=2030-12-31');
      setSalesRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch sales records:', error);
      setError('Failed to fetch sales records');
    }
  };

  const handleApprove = async (userId) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/approve/${userId}`);
      setMessage('User approved successfully');
      fetchPendingUsers();
      fetchAllUsers();
    } catch (error) {
      console.error('Approve error:', error);
      setError('Failed to approve user: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (userId) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }

    if (window.confirm('Are you sure you want to deny this user registration?')) {
      setLoading(true);
      try {
        await api.delete(`/users/deny/${userId}`);
        setMessage('User registration denied');
        fetchPendingUsers();
        fetchAllUsers();
      } catch (error) {
        console.error('Deny error:', error);
        setError('Failed to deny user: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }

    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      setLoading(true);
      try {
        await api.put(`/users/${userId}/role`, { role: newRole });
        setMessage(`User role updated to ${newRole}`);
        fetchAllUsers();
      } catch (error) {
        console.error('Role change error:', error);
        setError('Failed to update user role: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setLoading(true);
      try {
        await api.delete(`/users/${userId}`);
        setMessage('User deleted successfully');
        fetchAllUsers();
      } catch (error) {
        console.error('Delete user error:', error);
        setError('Failed to delete user: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (!saleId) {
      setError('Invalid sale ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this sale record? This action cannot be undone.')) {
      setLoading(true);
      try {
        await api.delete(`/sales/${saleId}`);
        setMessage('Sale record deleted successfully');
        fetchSalesRecords();
      } catch (error) {
        console.error('Delete sale error:', error);
        setError('Failed to delete sale: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'user': return '#3b82f6';
      case 'viewer': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <div className="tabs" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'pending' ? 'btn-success' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({pendingUsers.length})
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-success' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          All Users ({allUsers.length})
        </button>
        <button 
          className={`btn ${activeTab === 'sales' ? 'btn-success' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Records
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === 'pending' && (
        <div className="table-container">
          {pendingUsers.length === 0 ? (
            <p>No pending user approvals</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(user.id)}
                        disabled={loading}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeny(user.id)}
                        disabled={loading}
                      >
                        Deny
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ 
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        backgroundColor: getRoleBadgeColor(user.role),
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td>
                    <span 
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: user.isApproved ? '#27ae60' : '#f39c12',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    >
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={loading}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesRecords.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{formatDate(sale.createdAt)}</td>
                  <td>{sale.buyerIdentifier}</td>
                  <td>
                    {sale.orderItems.map((item, index) => (
                      <div key={index} style={{ fontSize: '0.8rem' }}>
                        {item.quantity}x {item.menuItem?.name || 'Unknown'}
                        {item.selectedOption && ` (${item.selectedOption})`}
                      </div>
                    ))}
                  </td>
                  <td className="currency">{formatCurrency(sale.totalPrice)}</td>
                  <td>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteSale(sale.id)}
                      disabled={loading}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {salesRecords.length === 0 && <p>No sales records found.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
