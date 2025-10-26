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
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const guestMode = localStorage.getItem('isGuest');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else if (guestMode === 'true') {
      setIsGuest(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('isGuest');
    setUser(userData);
    setIsGuest(false);
  };

  const loginAsGuest = () => {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsGuest(true);
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isGuest');
    setUser(null);
    setIsGuest(false);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading StallFlow...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <div className="brand">
              <h1>StallFlow</h1>
              <span className="tagline">Sales Management</span>
            </div>
            
            {(user || isGuest) && (
              <>
                <button 
                  className="menu-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
                
                <nav className={`main-nav ${sidebarOpen ? 'nav-open' : ''}`}>
                  <a href="/dashboard" onClick={() => setSidebarOpen(false)}>
                    📊 Dashboard
                  </a>
                  <a href="/reports" onClick={() => setSidebarOpen(false)}>
                    📈 Reports
                  </a>
                  {user && (
                    <>
                      <a href="/sales" onClick={() => setSidebarOpen(false)}>
                        ➕ New Sale
                      </a>
                      {user.role === 'admin' && (
                        <a href="/admin" onClick={() => setSidebarOpen(false)}>
                          ⚙️ Admin
                        </a>
                      )}
                    </>
                  )}
                  <button onClick={logout} className="logout-btn">
                    🚪 {isGuest ? 'Exit Guest Mode' : 'Logout'}
                  </button>
                </nav>
              </>
            )}
          </div>
        </header>

        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Routes>
            <Route 
              path="/" 
              element={(user || isGuest) ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={(user || isGuest) ? <Navigate to="/dashboard" /> : <Login onLogin={login} onGuestLogin={loginAsGuest} />} 
            />
            <Route 
              path="/register" 
              element={(user || isGuest) ? <Navigate to="/dashboard" /> : <Register />} 
            />
            <Route 
              path="/dashboard" 
              element={(user || isGuest) ? <Dashboard isGuest={isGuest} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/sales" 
              element={user ? <SalesForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/reports" 
              element={(user || isGuest) ? <SalesReport /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} 
            />
          </Routes>
        </div>

        {sidebarOpen && (
          <div 
            className="overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </Router>
  );
}

export default App;