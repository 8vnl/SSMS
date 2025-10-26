import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Login = ({ onLogin, onGuestLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login...');
      const response = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('Login successful:', response.data);
      const { token, user } = response.data;
      onLogin(user, token);
      
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    if (window.confirm('Continue as guest? You will be able to view sales data but cannot create new sales.')) {
      onGuestLogin();
    }
  };

  return (
    <div className="form-container">
      <h2>Welcome to StallFlow</h2>
      
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="admin@ssms.com"
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter your password"
          />
        </div>

        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}></div>
        <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>Or continue as guest</p>
        <button 
          type="button" 
          className="btn btn-success"
          onClick={handleGuestLogin}
          style={{ width: '100%' }}
        >
          👀 Continue as Guest
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
          View sales data without an account
        </p>
      </div>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
        <p><strong>Demo Credentials:</strong></p>
        <p>Email: admin@ssms.com</p>
        <p>Password: admin123</p>
      </div>
    </div>
  );
};

export default Login;
