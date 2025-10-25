import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingUsers();
    fetchAllUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/users/pending');
      console.log('Pending users:', response.data);
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      setError('Failed to fetch pending users');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      console.log('All users:', response.data);
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users');
    }
  };

  const handleApprove = async (userId) => {
    console.log('Approving user ID:', userId);
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
    console.log('Denying user ID:', userId);
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <div className="tabs" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
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
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span 
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: user.role === 'admin' ? '#e74c3c' : '#3498db',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    >
                      {user.role}
                    </span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
