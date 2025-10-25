import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SalesForm from './components/SalesForm';
import SalesReport from './components/SalesReport';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>Stall Sales Management System</h1>
          {user && (
            <nav className="main-nav">
              <a href="/dashboard">Dashboard</a>
              <a href="/sales">New Sale</a>
              <a href="/reports">Reports</a>
              {user.role === 'admin' && <a href="/admin">Admin</a>}
              <button onClick={logout} className="logout-btn">Logout</button>
            </nav>
          )}
        </header>

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" /> : <Register />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/sales" 
              element={user ? <SalesForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/reports" 
              element={user ? <SalesReport /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;