import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Auth({ setUser }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialMode = searchParams.get('mode') || 'login';
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'donor',  // Added role selection support
    age: '',
    gender: 'Male',
    blood_group: 'A+',
    phone: '',
    location: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Toggle between Login and Register using Tabs logic
  const handleTabChange = (mode) => {
    setIsLogin(mode === 'login');
    setSearchParams({ mode });
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Custom Validation logic
    if (!formData.email || !formData.email.includes('@')) {
      return setError('Invalid email');
    }
    if (!formData.password) {
      return setError('Password required');
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/dashboard'); // Both Admin and Donor land gracefully on Dashboard
      } else {
        await api.register(formData);
        // Automatically login after register
        const data = await api.login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center container mt-8 mb-12 animate-fade-in">
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
        
        {/* Toggle Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
          <button 
            type="button"
            onClick={() => handleTabChange('login')}
            style={{
              flex: 1, padding: '1.2rem 1rem', border: 'none', background: 'transparent', 
              cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem',
              color: isLogin ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: isLogin ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'var(--transition)', outline: 'none'
            }}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange('register')}
            style={{
              flex: 1, padding: '1.2rem 1rem', border: 'none', background: 'transparent', 
              cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem',
              color: !isLogin ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: !isLogin ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'var(--transition)', outline: 'none'
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={{ padding: '2.5rem 2rem' }}>
          <h2 className="text-2xl font-bold mb-6 text-center text-secondary">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>

          {error && (
            <div className="mb-6 p-3 badge-red text-center" style={{ borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            <div className="form-group animate-fade-in">
              <label className="form-label">Email Address</label>
              <input 
                type="email" name="email" className="form-input" 
                placeholder="Enter your email"
                required value={formData.email} onChange={handleChange} 
              />
            </div>

            <div className="form-group animate-fade-in">
              <label className="form-label">Password</label>
              <input 
                type="password" name="password" className="form-input" 
                placeholder="Enter your password"
                required value={formData.password} onChange={handleChange} 
              />
            </div>

            {!isLogin && (
              <div className="animate-fade-in mt-4">
                
                <div className="form-group">
                  <label className="form-label">Registration Type (Role)</label>
                  <select name="role" className="form-select" value={formData.role} onChange={handleChange} style={{ fontWeight: 600 }}>
                    <option value="donor">Individual Donor</option>
                    <option value="admin">Hospital / Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {formData.role === 'admin' ? 'Hospital / Org Name' : 'Full Name'}
                  </label>
                  <input 
                    type="text" name="name" className="form-input" 
                    placeholder={formData.role === 'admin' ? 'e.g. general hospital' : 'e.g. john doe'}
                    required value={formData.name} onChange={handleChange} 
                  />
                </div>

                {formData.role === 'donor' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input 
                        type="number" name="age" className="form-input" 
                        placeholder="e.g. 25" required={formData.role === 'donor'} 
                        value={formData.age} onChange={handleChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {formData.role === 'donor' && (
                    <div className="form-group">
                      <label className="form-label">Blood Group</label>
                      <select name="blood_group" className="form-select" value={formData.blood_group} onChange={handleChange}>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  )}
                  <div className={"form-group " + (formData.role !== 'donor' ? 'col-span-2' : '')} style={formData.role !== 'donor' ? {gridColumn: 'span 2'} : {}}>
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" name="phone" className="form-input" 
                      placeholder="e.g. 555-0000" required 
                      value={formData.phone} onChange={handleChange} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location (City/Area)</label>
                  <input 
                    type="text" name="location" className="form-input" 
                    placeholder="Enter your city/area" required 
                    value={formData.location} onChange={handleChange} 
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          
          {isLogin && (
             <p className="text-center mt-6 text-muted" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
               <strong>Test Admin: </strong> <em>admin@hospital.com</em> / <em>admin123</em>
             </p>
          )}
        </div>
      </div>
    </div>
  );
}
