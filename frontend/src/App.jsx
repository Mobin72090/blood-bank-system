import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, Menu } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SearchDonors from './pages/SearchDonors';
import EmergencyRequests from './pages/EmergencyRequests';

import { api } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Session expired');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  if (loading) return <div className="container mt-8 text-center text-muted">Authenticating seamlessly...</div>;

  return (
    <div>
      <nav className="navbar">
        <div className="container flex items-center justify-between" style={{ width: '100%' }}>
          <Link to="/" className="brand">
            <div style={{ background: 'var(--primary-gradient)', padding: '0.5rem', borderRadius: '12px', display: 'flex' }}>
              <Activity color="white" size={24} />
            </div>
            <span>Lifeline</span>
          </Link>

          <div className="nav-links">
            {user ? (
              <>
                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                {user.role === 'admin' && (
                  <>
                    <Link to="/search" className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}>Directory</Link>
                    <Link to="/requests" className={`nav-link ${location.pathname === '/requests' ? 'active' : ''}`}>Emergency Alerts</Link>
                  </>
                )}
                {user.role === 'donor' && (
                  <Link to="/requests" className={`nav-link ${location.pathname === '/requests' ? 'active' : ''}`}>Alerts</Link>
                )}
                <div style={{ paddingLeft: '1.5rem', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                     <span className="font-bold text-sm" style={{ lineHeight: 1 }}>{user.name}</span>
                     <span className="text-primary text-sm" style={{ fontWeight: 600, fontSize: '0.75rem' }}>{user.role.toUpperCase()}</span>
                  </div>
                  <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '10px' }}>
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/auth?mode=login" className="btn btn-secondary">Sign In</Link>
                <Link to="/auth?mode=register" className="btn btn-primary">Join as Donor</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container pt-6 pb-12" style={{ minHeight: 'calc(100vh - 90px)' }}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/auth" element={<Auth setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/search" element={<SearchDonors user={user} />} />
          <Route path="/requests" element={<EmergencyRequests user={user} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
